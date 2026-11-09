import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FURNITURE_DEFS,
  HOUSE_COLORS,
  PARADE_GOAL,
  ROOM_DEFS,
  SIM_REACTIONS,
  THEME_PACKS,
  type FurnitureCategory,
  type FurnitureKind,
  type RoomKind,
} from '../data/catalog'
import { DEMO_HOUSE_CODES, makeFriendHouses, makeRoom, makeStarterHouse, uid } from '../data/friends'
import {
  decodeHouseCode,
  encodeHouseCode,
  payloadToHouse,
  readHashCode,
  shareLinkFor,
} from '../data/houseCode'
import type { GameSave, HouseState, PlacedItem, SoftSim, StreetEventState } from '../data/types'

const SAVE_KEY = 'doorway-district-v2'

function defaultEvent(): StreetEventState {
  return {
    id: 'parade',
    title: 'Parade Float Weekend',
    goal: PARADE_GOAL,
    progress: 3,
    completed: false,
    contributed: 0,
  }
}

function migrateMood(sim: SoftSim | null): SoftSim | null {
  if (!sim) return null
  return {
    ...sim,
    mood: Math.max(35, Math.min(100, sim.mood)),
    vibe: sim.vibe ?? moodLabel(sim.mood),
    energy: sim.energy ?? 70,
  }
}

function moodLabel(mood: number): keyof (typeof SIM_REACTIONS)['pet'] {
  if (mood > 80) return 'thriving'
  if (mood > 55) return 'happy'
  if (mood > 40) return 'okay'
  return 'sleepy'
}

function loadSave(): GameSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem('doorway-district-v1')
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GameSave> & { version?: number; streetEvent?: unknown }
    if (!parsed?.player) return null
    const friends = parsed.friends?.length ? parsed.friends : makeFriendHouses()
    const event =
      parsed.streetEvent && typeof parsed.streetEvent === 'object' && 'goal' in (parsed.streetEvent as object)
        ? (parsed.streetEvent as StreetEventState)
        : defaultEvent()
    return {
      version: 2,
      player: {
        ...parsed.player,
        sim: migrateMood(parsed.player.sim),
        code: parsed.player.code ?? 'MYDOOR',
      },
      friends: friends.map((f) => ({ ...f, sim: migrateMood(f.sim) })),
      invited: parsed.invited ?? ['friend-mia'],
      streetEvent: event,
      lastVisit: parsed.lastVisit ?? null,
      importedCodes: parsed.importedCodes ?? [],
      snapGrid: parsed.snapGrid ?? true,
    }
  } catch {
    return null
  }
}

function createNewSave(): GameSave {
  return {
    version: 2,
    player: makeStarterHouse('You', 'My Doorway', HOUSE_COLORS[0], true),
    friends: makeFriendHouses(),
    invited: ['friend-mia', 'friend-rio'],
    streetEvent: defaultEvent(),
    lastVisit: null,
    importedCodes: [],
    snapGrid: true,
  }
}

function snap(value: number, enabled: boolean) {
  if (!enabled) return Math.max(4, Math.min(88, value))
  const stepped = Math.round(value / 4) * 4
  return Math.max(4, Math.min(88, stepped))
}

function countEventPieces(house: HouseState) {
  return house.rooms.reduce((n, room) => {
    return (
      n +
      room.items.reduce((m, it) => {
        const def = FURNITURE_DEFS.find((f) => f.id === it.kind)
        return m + (def?.eventBoost ?? 0)
      }, 0)
    )
  }, 0)
}

export type View =
  | { name: 'street' }
  | { name: 'house'; houseId: string; mode: 'edit' | 'visit' }
  | { name: 'invite' }
  | { name: 'share' }

export function useGame() {
  const [save, setSave] = useState<GameSave>(() => loadSave() ?? createNewSave())
  const [view, setView] = useState<View>({ name: 'street' })
  const [toast, setToast] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [placing, setPlacing] = useState<FurnitureKind | null>(null)
  const [furnitureFilter, setFurnitureFilter] = useState<FurnitureCategory | 'all'>('all')
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null)
  const [simBubble, setSimBubble] = useState<string | null>(null)
  const [undoStack, setUndoStack] = useState<PlacedItem[]>([])

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  }, [save])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!simBubble) return
    const t = window.setTimeout(() => setSimBubble(null), 2800)
    return () => window.clearTimeout(t)
  }, [simBubble])

  const flash = useCallback((msg: string) => setToast(msg), [])

  const speakSim = useCallback((sim: SoftSim | null) => {
    if (!sim) return
    const band = moodLabel(sim.mood)
    const lines = SIM_REACTIONS[sim.type][band]
    setSimBubble(lines[Math.floor(Math.random() * lines.length)])
  }, [])

  // Soft mood drift — never punishing (floors at 35)
  useEffect(() => {
    const tick = window.setInterval(() => {
      setSave((prev) => {
        if (!prev.player.sim) return prev
        const sim = prev.player.sim
        const drift = sim.mood > 70 ? -1 : sim.mood < 50 ? 1 : 0
        const nextMood = Math.max(35, Math.min(100, sim.mood + drift))
        if (nextMood === sim.mood) return prev
        return {
          ...prev,
          player: {
            ...prev.player,
            sim: { ...sim, mood: nextMood, vibe: moodLabel(nextMood) },
          },
        }
      })
    }, 45000)
    return () => window.clearInterval(tick)
  }, [])

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

  const enterHouse = useCallback(
    (houseId: string) => {
      const isPlayer = houseId === save.player.id
      setView({ name: 'house', houseId, mode: isPlayer ? 'edit' : 'visit' })
      setSelectedItem(null)
      setPlacing(null)
      setGhost(null)
      if (!isPlayer) {
        setSave((s) => ({ ...s, lastVisit: houseId }))
      }
    },
    [save.player.id],
  )

  const goStreet = useCallback(() => {
    setView({ name: 'street' })
    setSelectedItem(null)
    setPlacing(null)
    setGhost(null)
  }, [])

  const renameHouse = useCallback(
    (name: string) => {
      updateHouse(save.player.id, (h) => ({ ...h, houseName: name.slice(0, 24) || h.houseName }))
    },
    [save.player.id, updateHouse],
  )

  const setHouseColor = useCallback(
    (color: string) => {
      updateHouse(save.player.id, (h) => ({ ...h, color }))
      flash('Door color updated!')
    },
    [save.player.id, updateHouse, flash],
  )

  const addRoom = useCallback(
    (kind: RoomKind) => {
      const def = ROOM_DEFS.find((r) => r.id === kind)!
      const room = makeRoom(kind)
      updateHouse(save.player.id, (h) => ({
        ...h,
        rooms: [...h.rooms, room],
        activeRoomId: room.id,
        sim: bumpSimMood(h.sim, 6),
      }))
      flash(`Added ${def.name}!`)
      speakSim(save.player.sim)
    },
    [save.player.id, save.player.sim, updateHouse, flash, speakSim],
  )

  const setActiveRoom = useCallback(
    (houseId: string, roomId: string) => {
      updateHouse(houseId, (h) => ({ ...h, activeRoomId: roomId }))
      setSelectedItem(null)
    },
    [updateHouse],
  )

  const paintRoom = useCallback(
    (wall?: string, floor?: string) => {
      if (!activeRoom) return
      updateHouse(save.player.id, (h) => ({
        ...h,
        rooms: h.rooms.map((r) =>
          r.id === h.activeRoomId ? { ...r, wall: wall ?? r.wall, floor: floor ?? r.floor } : r,
        ),
        sim: bumpSimMood(h.sim, 2),
      }))
    },
    [activeRoom, save.player.id, updateHouse],
  )

  const applyTheme = useCallback(
    (themeId: string) => {
      const theme = THEME_PACKS.find((t) => t.id === themeId)
      if (!theme || !activeRoom) return
      updateHouse(save.player.id, (h) => ({
        ...h,
        rooms: h.rooms.map((r) =>
          r.id === h.activeRoomId
            ? { ...r, wall: theme.wall, floor: theme.floor, themeId: theme.id }
            : r,
        ),
        sim: bumpSimMood(h.sim, 8),
      }))
      flash(`${theme.emoji} ${theme.name} applied`)
      speakSim(save.player.sim)
    },
    [activeRoom, save.player.id, save.player.sim, updateHouse, flash, speakSim],
  )

  const placeItemAt = useCallback(
    (x: number, y: number) => {
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
        x: snap(x, save.snapGrid),
        y: snap(y, save.snapGrid),
        rot: 0,
      }
      updateHouse(save.player.id, (h) => ({
        ...h,
        rooms: h.rooms.map((r) =>
          r.id === h.activeRoomId ? { ...r, items: [...r.items, item] } : r,
        ),
        sim: bumpSimMood(h.sim, 4),
      }))
      setUndoStack((s) => [...s.slice(-19), item])
      setSelectedItem(item.id)

      if (def.eventBoost) {
        setSave((prev) => {
          const contributed = prev.streetEvent.contributed + def.eventBoost!
          const progress = Math.min(prev.streetEvent.goal, prev.streetEvent.progress + def.eventBoost!)
          const completed = progress >= prev.streetEvent.goal
          return {
            ...prev,
            streetEvent: {
              ...prev.streetEvent,
              contributed,
              progress,
              completed: completed || prev.streetEvent.completed,
            },
          }
        })
        flash(`Placed ${def.name} · parade +${def.eventBoost}`)
      } else {
        flash(`Placed ${def.name}`)
      }
      speakSim(save.player.sim)
    },
    [placing, view, activeRoom, save.snapGrid, save.player.id, save.player.sim, updateHouse, flash, speakSim],
  )

  const moveItem = useCallback(
    (itemId: string, x: number, y: number) => {
      updateHouse(save.player.id, (h) => ({
        ...h,
        rooms: h.rooms.map((r) =>
          r.id === h.activeRoomId
            ? {
                ...r,
                items: r.items.map((it) =>
                  it.id === itemId
                    ? { ...it, x: snap(x, save.snapGrid), y: snap(y, save.snapGrid) }
                    : it,
                ),
              }
            : r,
        ),
      }))
    },
    [save.player.id, save.snapGrid, updateHouse],
  )

  const rotateSelected = useCallback(() => {
    if (!selectedItem) return
    updateHouse(save.player.id, (h) => ({
      ...h,
      rooms: h.rooms.map((r) =>
        r.id === h.activeRoomId
          ? {
              ...r,
              items: r.items.map((it) => {
                if (it.id !== selectedItem) return it
                const next = (((it.rot ?? 0) + 90) % 360) as 0 | 90 | 180 | 270
                return { ...it, rot: next }
              }),
            }
          : r,
      ),
    }))
  }, [selectedItem, save.player.id, updateHouse])

  const removeItem = useCallback(
    (itemId: string) => {
      updateHouse(save.player.id, (h) => ({
        ...h,
        rooms: h.rooms.map((r) =>
          r.id === h.activeRoomId ? { ...r, items: r.items.filter((it) => it.id !== itemId) } : r,
        ),
      }))
      setSelectedItem(null)
      flash('Removed')
    },
    [save.player.id, updateHouse, flash],
  )

  const undoPlace = useCallback(() => {
    const last = undoStack[undoStack.length - 1]
    if (!last) {
      flash('Nothing to undo')
      return
    }
    removeItem(last.id)
    setUndoStack((s) => s.slice(0, -1))
    flash('Undid last place')
  }, [undoStack, removeItem, flash])

  const inviteFriend = useCallback(
    (friendId: string) => {
      setSave((s) => ({
        ...s,
        invited: s.invited.includes(friendId) ? s.invited : [...s.invited, friendId],
      }))
      flash('Invite sent! They can visit your house.')
    },
    [flash],
  )

  const leaveNote = useCallback(
    (houseId: string, noteId: string) => {
      updateHouse(houseId, (h) => ({
        ...h,
        notes: [
          { id: uid('note'), from: save.player.ownerName, noteId, at: Date.now() },
          ...h.notes,
        ].slice(0, 8),
      }))
      setSave((prev) => {
        if (prev.streetEvent.completed) return prev
        const progress = Math.min(prev.streetEvent.goal, prev.streetEvent.progress + 1)
        return {
          ...prev,
          streetEvent: {
            ...prev.streetEvent,
            progress,
            completed: progress >= prev.streetEvent.goal,
          },
        }
      })
      flash('Friendly note left!')
    },
    [save.player.ownerName, updateHouse, flash],
  )

  const careSim = useCallback(() => {
    const current = save.player.sim
    if (!current) return
    const mood = Math.min(100, current.mood + 18)
    const next: SoftSim = {
      ...current,
      mood,
      lastCare: Date.now(),
      vibe: moodLabel(mood),
      energy: Math.min(100, (current.energy ?? 70) + 12),
    }
    updateHouse(save.player.id, (h) => ({ ...h, sim: next }))
    speakSim(next)
    flash(current.type === 'pet' ? 'Pet is happy!' : 'Plant perked up!')
  }, [save.player.id, save.player.sim, updateHouse, flash, speakSim])

  const setSim = useCallback(
    (type: SoftSim['type']) => {
      const next: SoftSim = {
        type,
        name: type === 'pet' ? 'Puddle' : 'Sprout',
        mood: 80,
        lastCare: Date.now(),
        vibe: 'happy',
        energy: 75,
      }
      updateHouse(save.player.id, (h) => ({ ...h, sim: next }))
      speakSim(next)
      flash(type === 'pet' ? 'A new pet moved in!' : 'A new plant sprouted!')
    },
    [save.player.id, updateHouse, flash, speakSim],
  )

  const renameSim = useCallback(
    (name: string) => {
      updateHouse(save.player.id, (h) =>
        h.sim ? { ...h, sim: { ...h.sim, name: name.slice(0, 14) || h.sim.name } } : h,
      )
    },
    [save.player.id, updateHouse],
  )

  const toggleSnap = useCallback(() => {
    setSave((s) => ({ ...s, snapGrid: !s.snapGrid }))
  }, [])

  const importHouseCode = useCallback(
    (raw: string, silent = false): boolean => {
      const upper = raw.trim().toUpperCase()
      const demoId = DEMO_HOUSE_CODES[upper]
      if (demoId) {
        setSave((s) => ({
          ...s,
          invited: s.invited.includes(demoId) ? s.invited : [...s.invited, demoId],
          importedCodes: s.importedCodes.includes(upper) ? s.importedCodes : [...s.importedCodes, upper],
        }))
        if (!silent) flash(`Unlocked ${upper} — visit from the street!`)
        enterHouse(demoId)
        return true
      }

      const payload = decodeHouseCode(raw.trim())
      if (!payload) {
        if (!silent) flash('That code did not work')
        return false
      }
      const guestId = `shared-${uid('h')}`
      const house = payloadToHouse(payload, guestId)
      setSave((s) => ({
        ...s,
        friends: [...s.friends.filter((f) => f.id !== guestId), house],
        invited: [...s.invited, guestId],
        importedCodes: [...s.importedCodes, raw.trim().slice(0, 24)],
      }))
      if (!silent) flash(`Visiting ${house.houseName}!`)
      enterHouse(guestId)
      return true
    },
    [enterHouse, flash],
  )

  const copyShareLink = useCallback(async () => {
    const link = shareLinkFor(save.player)
    const code = encodeHouseCode(save.player)
    try {
      await navigator.clipboard.writeText(link)
      flash('Share link copied!')
    } catch {
      flash(`Code: ${code.slice(0, 18)}…`)
    }
    return { link, code }
  }, [save.player, flash])

  // Import shared house from URL hash once
  useEffect(() => {
    const code = readHashCode()
    if (!code) return
    const ok = importHouseCode(code, true)
    if (ok) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    // mount-only import from share link
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const contributeParade = useCallback(() => {
    const boost = Math.max(1, Math.min(4, countEventPieces(save.player)))
    setSave((prev) => {
      const progress = Math.min(prev.streetEvent.goal, prev.streetEvent.progress + boost)
      return {
        ...prev,
        streetEvent: {
          ...prev.streetEvent,
          progress,
          contributed: prev.streetEvent.contributed + boost,
          completed: progress >= prev.streetEvent.goal || prev.streetEvent.completed,
        },
        player: {
          ...prev.player,
          sim: bumpSimMood(prev.player.sim, 5),
        },
      }
    })
    flash(`Street float +${boost}!`)
    speakSim(save.player.sim)
  }, [save.player, flash, speakSim])

  const resetGame = useCallback(() => {
    const next = createNewSave()
    setSave(next)
    setView({ name: 'street' })
    setUndoStack([])
    flash('Fresh street — start decorating!')
  }, [flash])

  const decorationScore = useMemo(() => {
    return save.player.rooms.reduce((n, r) => n + r.items.length, 0)
  }, [save.player.rooms])

  const playerEventScore = useMemo(() => countEventPieces(save.player), [save.player])

  const myShareCode = useMemo(() => encodeHouseCode(save.player), [save.player])

  return {
    save,
    view,
    toast,
    houses,
    currentHouse,
    activeRoom,
    selectedItem,
    placing,
    furnitureFilter,
    ghost,
    simBubble,
    decorationScore,
    playerEventScore,
    myShareCode,
    setView,
    setSelectedItem,
    setPlacing,
    setFurnitureFilter,
    setGhost,
    enterHouse,
    goStreet,
    renameHouse,
    setHouseColor,
    addRoom,
    setActiveRoom,
    paintRoom,
    applyTheme,
    placeItemAt,
    moveItem,
    rotateSelected,
    removeItem,
    undoPlace,
    inviteFriend,
    leaveNote,
    careSim,
    setSim,
    renameSim,
    toggleSnap,
    importHouseCode,
    copyShareLink,
    contributeParade,
    resetGame,
    flash,
    speakSim,
  }
}

function bumpSimMood(sim: SoftSim | null, amount: number): SoftSim | null {
  if (!sim) return sim
  const mood = Math.min(100, Math.max(35, sim.mood + amount))
  return { ...sim, mood, vibe: moodLabel(mood) }
}

export type GameApi = ReturnType<typeof useGame>
