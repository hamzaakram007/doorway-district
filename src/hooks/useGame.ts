import { useCallback, useEffect, useMemo, useState } from 'react'
import { FURNITURE_DEFS, HOUSE_COLORS, ROOM_DEFS, type FurnitureKind, type RoomKind } from '../data/catalog'
import { makeFriendHouses, makeRoom, makeStarterHouse, uid } from '../data/friends'
import type { GameSave, HouseState, PlacedItem, SoftSim } from '../data/types'

const SAVE_KEY = 'doorway-district-v1'

function loadSave(): GameSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameSave
    if (parsed?.version !== 1 || !parsed.player) return null
    return parsed
  } catch {
    return null
  }
}

function createNewSave(): GameSave {
  return {
    version: 1,
    player: makeStarterHouse('You', 'My Doorway', HOUSE_COLORS[0], true),
    friends: makeFriendHouses(),
    invited: ['friend-mia'],
    streetEvent: 'parade',
    lastVisit: null,
  }
}

export type View =
  | { name: 'street' }
  | { name: 'house'; houseId: string; mode: 'edit' | 'visit' }
  | { name: 'invite' }

export function useGame() {
  const [save, setSave] = useState<GameSave>(() => loadSave() ?? createNewSave())
  const [view, setView] = useState<View>({ name: 'street' })
  const [toast, setToast] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [placing, setPlacing] = useState<FurnitureKind | null>(null)

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  }, [save])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  const flash = useCallback((msg: string) => setToast(msg), [])

  const houses = useMemo(() => [save.player, ...save.friends], [save.player, save.friends])

  const currentHouse: HouseState | null = useMemo(() => {
    if (view.name !== 'house') return null
    return houses.find((h) => h.id === view.houseId) ?? null
  }, [view, houses])

  const activeRoom = useMemo(() => {
    if (!currentHouse) return null
    return currentHouse.rooms.find((r) => r.id === currentHouse.activeRoomId) ?? currentHouse.rooms[0] ?? null
  }, [currentHouse])

  const updateHouse = useCallback((houseId: string, updater: (h: HouseState) => HouseState) => {
    setSave((prev) => {
      if (prev.player.id === houseId) {
        return { ...prev, player: updater(prev.player) }
      }
      return {
        ...prev,
        friends: prev.friends.map((f) => (f.id === houseId ? updater(f) : f)),
      }
    })
  }, [])

  const enterHouse = useCallback((houseId: string) => {
    const isPlayer = houseId === save.player.id
    setView({ name: 'house', houseId, mode: isPlayer ? 'edit' : 'visit' })
    setSelectedItem(null)
    setPlacing(null)
    if (!isPlayer) {
      setSave((s) => ({ ...s, lastVisit: houseId }))
    }
  }, [save.player.id])

  const goStreet = useCallback(() => {
    setView({ name: 'street' })
    setSelectedItem(null)
    setPlacing(null)
  }, [])

  const renameHouse = useCallback((name: string) => {
    updateHouse(save.player.id, (h) => ({ ...h, houseName: name.slice(0, 24) || h.houseName }))
  }, [save.player.id, updateHouse])

  const setHouseColor = useCallback((color: string) => {
    updateHouse(save.player.id, (h) => ({ ...h, color }))
    flash('Door color updated!')
  }, [save.player.id, updateHouse, flash])

  const addRoom = useCallback((kind: RoomKind) => {
    const def = ROOM_DEFS.find((r) => r.id === kind)!
    const room = makeRoom(kind)
    updateHouse(save.player.id, (h) => ({
      ...h,
      rooms: [...h.rooms, room],
      activeRoomId: room.id,
    }))
    flash(`Added ${def.name}!`)
  }, [save.player.id, updateHouse, flash])

  const setActiveRoom = useCallback((houseId: string, roomId: string) => {
    updateHouse(houseId, (h) => ({ ...h, activeRoomId: roomId }))
    setSelectedItem(null)
  }, [updateHouse])

  const paintRoom = useCallback((wall?: string, floor?: string) => {
    if (!activeRoom) return
    updateHouse(save.player.id, (h) => ({
      ...h,
      rooms: h.rooms.map((r) =>
        r.id === h.activeRoomId
          ? { ...r, wall: wall ?? r.wall, floor: floor ?? r.floor }
          : r,
      ),
    }))
  }, [activeRoom, save.player.id, updateHouse])

  const placeItemAt = useCallback((x: number, y: number) => {
    if (!placing || view.name !== 'house' || view.mode !== 'edit') return
    const def = FURNITURE_DEFS.find((f) => f.id === placing)!
    const room = activeRoom
    if (!room) return
    if (def.rooms && !def.rooms.includes(room.kind)) {
      flash(`That fits better in a ${def.rooms.join('/')} room`)
      return
    }
    const item: PlacedItem = {
      id: uid('item'),
      kind: placing,
      x: Math.max(4, Math.min(88, x)),
      y: Math.max(18, Math.min(78, y)),
    }
    updateHouse(save.player.id, (h) => ({
      ...h,
      rooms: h.rooms.map((r) =>
        r.id === h.activeRoomId ? { ...r, items: [...r.items, item] } : r,
      ),
      sim: bumpSimMood(h.sim, 4),
    }))
    setSelectedItem(item.id)
    flash(`Placed ${def.name}`)
  }, [placing, view, activeRoom, save.player.id, updateHouse, flash])

  const moveItem = useCallback((itemId: string, x: number, y: number) => {
    updateHouse(save.player.id, (h) => ({
      ...h,
      rooms: h.rooms.map((r) =>
        r.id === h.activeRoomId
          ? {
              ...r,
              items: r.items.map((it) =>
                it.id === itemId
                  ? { ...it, x: Math.max(4, Math.min(88, x)), y: Math.max(18, Math.min(78, y)) }
                  : it,
              ),
            }
          : r,
      ),
    }))
  }, [save.player.id, updateHouse])

  const removeItem = useCallback((itemId: string) => {
    updateHouse(save.player.id, (h) => ({
      ...h,
      rooms: h.rooms.map((r) =>
        r.id === h.activeRoomId
          ? { ...r, items: r.items.filter((it) => it.id !== itemId) }
          : r,
      ),
    }))
    setSelectedItem(null)
    flash('Removed')
  }, [save.player.id, updateHouse, flash])

  const inviteFriend = useCallback((friendId: string) => {
    setSave((s) => ({
      ...s,
      invited: s.invited.includes(friendId) ? s.invited : [...s.invited, friendId],
    }))
    flash('Invite sent! They can visit your house.')
  }, [flash])

  const leaveNote = useCallback((houseId: string, noteId: string) => {
    updateHouse(houseId, (h) => ({
      ...h,
      notes: [
        { id: uid('note'), from: save.player.ownerName, noteId, at: Date.now() },
        ...h.notes,
      ].slice(0, 8),
    }))
    flash('Friendly note left!')
  }, [save.player.ownerName, updateHouse, flash])

  const careSim = useCallback(() => {
    updateHouse(save.player.id, (h) => ({
      ...h,
      sim: h.sim
        ? { ...h.sim, mood: Math.min(100, h.sim.mood + 18), lastCare: Date.now() }
        : h.sim,
    }))
    flash(save.player.sim?.type === 'pet' ? 'Pet is happy!' : 'Plant perked up!')
  }, [save.player.id, save.player.sim?.type, updateHouse, flash])

  const setSim = useCallback((type: SoftSim['type']) => {
    updateHouse(save.player.id, (h) => ({
      ...h,
      sim: {
        type,
        name: type === 'pet' ? 'Puddle' : 'Sprout',
        mood: 80,
        lastCare: Date.now(),
      },
    }))
    flash(type === 'pet' ? 'A new pet moved in!' : 'A new plant sprouted!')
  }, [save.player.id, updateHouse, flash])

  const resetGame = useCallback(() => {
    const next = createNewSave()
    setSave(next)
    setView({ name: 'street' })
    flash('Fresh street — start decorating!')
  }, [flash])

  const decorationScore = useMemo(() => {
    return save.player.rooms.reduce((n, r) => n + r.items.length, 0)
  }, [save.player.rooms])

  return {
    save,
    view,
    toast,
    houses,
    currentHouse,
    activeRoom,
    selectedItem,
    placing,
    decorationScore,
    setView,
    setSelectedItem,
    setPlacing,
    enterHouse,
    goStreet,
    renameHouse,
    setHouseColor,
    addRoom,
    setActiveRoom,
    paintRoom,
    placeItemAt,
    moveItem,
    removeItem,
    inviteFriend,
    leaveNote,
    careSim,
    setSim,
    resetGame,
    flash,
  }
}

function bumpSimMood(sim: SoftSim | null, amount: number): SoftSim | null {
  if (!sim) return sim
  return { ...sim, mood: Math.min(100, sim.mood + amount) }
}

export type GameApi = ReturnType<typeof useGame>
