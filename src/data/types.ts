import type { FurnitureKind, RoomKind } from './catalog'

export interface PlacedItem {
  id: string
  kind: FurnitureKind
  x: number
  y: number
  rot?: 0 | 90 | 180 | 270
}

export interface RoomState {
  id: string
  kind: RoomKind
  name: string
  wall: string
  floor: string
  themeId?: string
  items: PlacedItem[]
}

export interface SoftSim {
  type: 'pet' | 'plant'
  name: string
  mood: number
  lastCare: number
  vibe?: string
  energy?: number
}

export interface FriendlyNote {
  id: string
  from: string
  noteId: string
  at: number
}

export interface HouseState {
  id: string
  ownerName: string
  houseName: string
  color: string
  rooms: RoomState[]
  activeRoomId: string
  sim: SoftSim | null
  notes: FriendlyNote[]
  isPlayer: boolean
  code?: string
}

export interface StreetEventState {
  id: 'parade'
  title: string
  goal: number
  progress: number
  completed: boolean
  contributed: number
}

export interface GameSave {
  version: 2
  player: HouseState
  friends: HouseState[]
  invited: string[]
  streetEvent: StreetEventState
  lastVisit: string | null
  importedCodes: string[]
  snapGrid: boolean
}

/** Compact payload embedded in share codes / links */
export interface SharePayload {
  v: 1
  n: string
  o: string
  c: string
  rooms: Array<{
    k: RoomKind
    w: string
    f: string
    t?: string
    items: Array<{ k: FurnitureKind; x: number; y: number; r?: 0 | 90 | 180 | 270 }>
  }>
  sim?: { t: SoftSim['type']; n: string }
}
