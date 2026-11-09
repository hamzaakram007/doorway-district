import { ROOM_DEFS } from './catalog'
import type { FurnitureKind, RoomKind } from './catalog'
import { makeRoom, uid } from './friends'
import type { HouseState, SharePayload } from './types'

function toBase64Url(raw: string) {
  const bytes = new TextEncoder().encode(raw)
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(token: string) {
  const padded = token.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const bin = atob(padded + pad)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function houseToPayload(house: HouseState): SharePayload {
  return {
    v: 1,
    n: house.houseName.slice(0, 24),
    o: house.ownerName.slice(0, 18),
    c: house.color,
    rooms: house.rooms.map((r) => ({
      k: r.kind,
      w: r.wall,
      f: r.floor,
      t: r.themeId,
      items: r.items.map((it) => ({
        k: it.kind,
        x: Math.round(it.x),
        y: Math.round(it.y),
        r: it.rot ?? 0,
      })),
    })),
    sim: house.sim ? { t: house.sim.type, n: house.sim.name } : undefined,
  }
}

export function encodeHouseCode(house: HouseState): string {
  return `DD1.${toBase64Url(JSON.stringify(houseToPayload(house)))}`
}

export function decodeHouseCode(code: string): SharePayload | null {
  const trimmed = code.trim()
  if (!trimmed) return null
  try {
    const raw = trimmed.startsWith('DD1.') ? trimmed.slice(4) : trimmed
    const parsed = JSON.parse(fromBase64Url(raw)) as SharePayload
    if (parsed?.v !== 1 || !parsed.n || !Array.isArray(parsed.rooms)) return null
    return parsed
  } catch {
    return null
  }
}

export function payloadToHouse(payload: SharePayload, id?: string): HouseState {
  const rooms = payload.rooms.map((r) => {
    const def = ROOM_DEFS.find((d) => d.id === r.k)
    const room = makeRoom((r.k as RoomKind) || 'living', {
      wall: r.w || def?.wall,
      floor: r.f || def?.floor,
      themeId: r.t,
      items: (r.items ?? []).map((it) => ({
        id: uid('item'),
        kind: it.k as FurnitureKind,
        x: it.x,
        y: it.y,
        rot: (it.r ?? 0) as 0 | 90 | 180 | 270,
      })),
    })
    return room
  })
  const first = rooms[0] ?? makeRoom('living')
  return {
    id: id ?? uid('guest'),
    ownerName: payload.o || 'Friend',
    houseName: payload.n || 'Shared House',
    color: payload.c || '#ef7b5a',
    rooms: rooms.length ? rooms : [first],
    activeRoomId: first.id,
    sim: payload.sim
      ? {
          type: payload.sim.t,
          name: payload.sim.n,
          mood: 82,
          lastCare: Date.now(),
          vibe: 'happy',
          energy: 70,
        }
      : null,
    notes: [],
    isPlayer: false,
    code: 'SHARED',
  }
}

export function shareLinkFor(house: HouseState): string {
  const code = encodeHouseCode(house)
  const url = new URL(window.location.href)
  url.hash = `house=${code}`
  return url.toString()
}

export function readHashCode(): string | null {
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash.startsWith('house=')) return null
  return decodeURIComponent(hash.slice('house='.length))
}
