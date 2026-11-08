import type { FurnitureKind, RoomKind } from './catalog'

export interface PlacedItem {
  id: string
  kind: FurnitureKind
  x: number
  y: number
}

export interface RoomState {
  id: string
  kind: RoomKind
  name: string
  wall: string
  floor: string
  items: PlacedItem[]
}

export interface SoftSim {
  type: 'pet' | 'plant'
  name: string
  mood: number
  lastCare: number
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
}

export interface GameSave {
  version: 1
  player: HouseState
  friends: HouseState[]
  invited: string[]
  streetEvent: 'none' | 'parade' | 'porch'
  lastVisit: string | null
}
