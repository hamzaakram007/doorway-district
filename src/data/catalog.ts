export type RoomKind = 'living' | 'kitchen' | 'bedroom' | 'garden' | 'studio'

export type FurnitureKind =
  | 'sofa'
  | 'table'
  | 'lamp'
  | 'plant'
  | 'bed'
  | 'bookshelf'
  | 'rug'
  | 'chair'
  | 'window'
  | 'art'
  | 'toybox'
  | 'fountain'

export interface RoomDef {
  id: RoomKind
  name: string
  emoji: string
  wall: string
  floor: string
  hint: string
}

export interface FurnitureDef {
  id: FurnitureKind
  name: string
  emoji: string
  w: number
  h: number
  rooms?: RoomKind[]
}

export const ROOM_DEFS: RoomDef[] = [
  { id: 'living', name: 'Living Room', emoji: '🛋️', wall: '#d8efe6', floor: '#c4a574', hint: 'Cozy hangout' },
  { id: 'kitchen', name: 'Kitchen', emoji: '🍳', wall: '#fff0d6', floor: '#9aa7b5', hint: 'Snack central' },
  { id: 'bedroom', name: 'Bedroom', emoji: '🛏️', wall: '#e4e0f7', floor: '#b08968', hint: 'Dream space' },
  { id: 'garden', name: 'Garden', emoji: '🌿', wall: '#cfe8c9', floor: '#7a9e6a', hint: 'Fresh air' },
  { id: 'studio', name: 'Studio', emoji: '🎨', wall: '#ffe8ef', floor: '#d9c4a8', hint: 'Make stuff' },
]

export const FURNITURE_DEFS: FurnitureDef[] = [
  { id: 'sofa', name: 'Sofa', emoji: '🛋️', w: 18, h: 12 },
  { id: 'table', name: 'Table', emoji: '🪵', w: 14, h: 10 },
  { id: 'lamp', name: 'Lamp', emoji: '💡', w: 8, h: 12 },
  { id: 'plant', name: 'Plant', emoji: '🪴', w: 9, h: 12 },
  { id: 'bed', name: 'Bed', emoji: '🛏️', w: 20, h: 14, rooms: ['bedroom'] },
  { id: 'bookshelf', name: 'Books', emoji: '📚', w: 10, h: 14 },
  { id: 'rug', name: 'Rug', emoji: '🟧', w: 22, h: 14 },
  { id: 'chair', name: 'Chair', emoji: '🪑', w: 9, h: 10 },
  { id: 'window', name: 'Window', emoji: '🪟', w: 12, h: 12 },
  { id: 'art', name: 'Art', emoji: '🖼️', w: 10, h: 10 },
  { id: 'toybox', name: 'Toys', emoji: '🧸', w: 11, h: 10 },
  { id: 'fountain', name: 'Fountain', emoji: '⛲', w: 12, h: 12, rooms: ['garden'] },
]

export const WALL_SWATCHES = ['#d8efe6', '#fff0d6', '#e4e0f7', '#cfe8c9', '#ffe8ef', '#d6e8ff', '#ffd9c8']
export const FLOOR_SWATCHES = ['#c4a574', '#9aa7b5', '#b08968', '#7a9e6a', '#d9c4a8', '#8b7355', '#6b8f71']

export const FRIENDLY_NOTES = [
  { id: 'stars', label: 'So cozy!', emoji: '⭐' },
  { id: 'heart', label: 'Love this room', emoji: '💛' },
  { id: 'highfive', label: 'High five!', emoji: '🙌' },
  { id: 'wow', label: 'Wow wow wow', emoji: '✨' },
  { id: 'plant', label: 'Nice plants', emoji: '🌱' },
  { id: 'snack', label: 'Bring snacks next time', emoji: '🍪' },
]

export const HOUSE_COLORS = ['#ef7b5a', '#3d9b8f', '#f0b429', '#5b7cfa', '#c45d9a', '#6f9e4f']
