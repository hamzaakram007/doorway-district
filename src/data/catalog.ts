export type RoomKind =
  | 'living'
  | 'kitchen'
  | 'bedroom'
  | 'garden'
  | 'studio'
  | 'attic'
  | 'porch'
  | 'bath'

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
  | 'desk'
  | 'pillow'
  | 'fridge'
  | 'bathtub'
  | 'piano'
  | 'curtain'
  | 'lantern'
  | 'swing'
  | 'hammock'
  | 'stool'
  | 'mirror'
  | 'balloon'
  | 'banner'
  | 'floatpiece'

export type FurnitureCategory = 'cozy' | 'fun' | 'garden' | 'event'

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
  category: FurnitureCategory
  rooms?: RoomKind[]
  eventBoost?: number
}

export interface ThemePack {
  id: string
  name: string
  emoji: string
  wall: string
  floor: string
  accent: string
}

export const ROOM_DEFS: RoomDef[] = [
  { id: 'living', name: 'Living Room', emoji: '🛋️', wall: '#d5efe4', floor: '#b8895a', hint: 'Cozy hangout' },
  { id: 'kitchen', name: 'Kitchen', emoji: '🍳', wall: '#ffe7c2', floor: '#8fa0ae', hint: 'Snack central' },
  { id: 'bedroom', name: 'Bedroom', emoji: '🛏️', wall: '#dceefc', floor: '#a67c52', hint: 'Dream space' },
  { id: 'garden', name: 'Garden', emoji: '🌿', wall: '#c8e8b8', floor: '#6f9758', hint: 'Fresh air' },
  { id: 'studio', name: 'Studio', emoji: '🎨', wall: '#ffe0d4', floor: '#c9a98a', hint: 'Make stuff' },
  { id: 'attic', name: 'Attic Nook', emoji: '📦', wall: '#f0d9b5', floor: '#8a6a4a', hint: 'Secret stash' },
  { id: 'porch', name: 'Front Porch', emoji: '🚪', wall: '#cfeaf5', floor: '#d2b48c', hint: 'Street side' },
  { id: 'bath', name: 'Splash Bath', emoji: '🛁', wall: '#d4f0f5', floor: '#9bb8c4', hint: 'Bubbles only' },
]

export const FURNITURE_DEFS: FurnitureDef[] = [
  { id: 'sofa', name: 'Sofa', emoji: '🛋️', w: 18, h: 12, category: 'cozy' },
  { id: 'table', name: 'Table', emoji: '🪵', w: 14, h: 10, category: 'cozy' },
  { id: 'lamp', name: 'Lamp', emoji: '💡', w: 8, h: 12, category: 'cozy' },
  { id: 'plant', name: 'Plant', emoji: '🪴', w: 9, h: 12, category: 'garden' },
  { id: 'bed', name: 'Bed', emoji: '🛏️', w: 20, h: 14, category: 'cozy', rooms: ['bedroom', 'attic'] },
  { id: 'bookshelf', name: 'Books', emoji: '📚', w: 10, h: 14, category: 'cozy' },
  { id: 'rug', name: 'Rug', emoji: '🧶', w: 22, h: 14, category: 'cozy' },
  { id: 'chair', name: 'Chair', emoji: '🪑', w: 9, h: 10, category: 'cozy' },
  { id: 'window', name: 'Window', emoji: '🪟', w: 12, h: 12, category: 'cozy' },
  { id: 'art', name: 'Art', emoji: '🖼️', w: 10, h: 10, category: 'fun' },
  { id: 'toybox', name: 'Toys', emoji: '🧸', w: 11, h: 10, category: 'fun' },
  { id: 'fountain', name: 'Fountain', emoji: '⛲', w: 12, h: 12, category: 'garden', rooms: ['garden', 'porch'] },
  { id: 'desk', name: 'Desk', emoji: '🧺', w: 14, h: 11, category: 'cozy', rooms: ['studio', 'attic', 'bedroom'] },
  { id: 'pillow', name: 'Pillow', emoji: '🛌', w: 10, h: 8, category: 'cozy' },
  { id: 'fridge', name: 'Fridge', emoji: '🧊', w: 10, h: 14, category: 'cozy', rooms: ['kitchen'] },
  { id: 'bathtub', name: 'Tub', emoji: '🛁', w: 16, h: 12, category: 'cozy', rooms: ['bath'] },
  { id: 'piano', name: 'Piano', emoji: '🎹', w: 16, h: 12, category: 'fun' },
  { id: 'curtain', name: 'Curtain', emoji: '🎀', w: 12, h: 14, category: 'cozy' },
  { id: 'lantern', name: 'Lantern', emoji: '🏮', w: 8, h: 11, category: 'fun', eventBoost: 1 },
  { id: 'swing', name: 'Swing', emoji: '🪢', w: 12, h: 14, category: 'garden', rooms: ['garden', 'porch'] },
  { id: 'hammock', name: 'Hammock', emoji: '🏝️', w: 18, h: 10, category: 'garden', rooms: ['garden', 'porch', 'attic'] },
  { id: 'stool', name: 'Stool', emoji: '🥛', w: 8, h: 8, category: 'cozy' },
  { id: 'mirror', name: 'Mirror', emoji: '🪞', w: 9, h: 12, category: 'cozy', rooms: ['bath', 'bedroom'] },
  { id: 'balloon', name: 'Balloon', emoji: '🎈', w: 8, h: 12, category: 'event', eventBoost: 1 },
  { id: 'banner', name: 'Banner', emoji: '🎏', w: 16, h: 10, category: 'event', eventBoost: 2 },
  { id: 'floatpiece', name: 'Float bit', emoji: '🎪', w: 14, h: 12, category: 'event', eventBoost: 3 },
]

export const THEME_PACKS: ThemePack[] = [
  { id: 'citrus', name: 'Sunny Citrus', emoji: '🍊', wall: '#ffe2b8', floor: '#c58b45', accent: '#ef7b5a' },
  { id: 'tide', name: 'Tide Pool', emoji: '🌊', wall: '#c8e8f0', floor: '#6f8f9e', accent: '#2f8f9a' },
  { id: 'grove', name: 'Leafy Grove', emoji: '🍃', wall: '#d5ecc8', floor: '#6f8f4e', accent: '#4f8f4a' },
  { id: 'ember', name: 'Ember Lane', emoji: '🔥', wall: '#ffd4c4', floor: '#a86a4a', accent: '#e25a3c' },
  { id: 'ink', name: 'Ink Sketch', emoji: '✏️', wall: '#e8eef2', floor: '#6a757c', accent: '#1c2b33' },
  { id: 'parade', name: 'Parade Pop', emoji: '🎉', wall: '#ffe8a8', floor: '#d4744a', accent: '#ef7b5a' },
]

export const WALL_SWATCHES = [
  '#d5efe4',
  '#ffe7c2',
  '#dceefc',
  '#c8e8b8',
  '#ffe0d4',
  '#f0d9b5',
  '#cfeaf5',
  '#d4f0f5',
  '#ffe2b8',
  '#ffd4c4',
]

export const FLOOR_SWATCHES = [
  '#b8895a',
  '#8fa0ae',
  '#a67c52',
  '#6f9758',
  '#c9a98a',
  '#8a6a4a',
  '#d2b48c',
  '#9bb8c4',
  '#c58b45',
  '#6a757c',
]

export const FRIENDLY_NOTES = [
  { id: 'stars', label: 'So cozy!', emoji: '⭐' },
  { id: 'heart', label: 'Love this room', emoji: '💛' },
  { id: 'highfive', label: 'High five!', emoji: '🙌' },
  { id: 'wow', label: 'Wow wow wow', emoji: '✨' },
  { id: 'plant', label: 'Nice plants', emoji: '🌱' },
  { id: 'snack', label: 'Bring snacks next time', emoji: '🍪' },
  { id: 'parade', label: 'Parade ready!', emoji: '🎊' },
  { id: 'pet', label: 'Cute companion!', emoji: '🐾' },
]

export const HOUSE_COLORS = ['#ef7b5a', '#2f8f9a', '#f0a43a', '#3d7a5a', '#d45d6a', '#c47a2a', '#4a7fa8']

export const SIM_REACTIONS = {
  pet: {
    thriving: ['Tail wags forever!', 'Ready for parade!', 'Best house ever!'],
    happy: ['Happy paws!', 'Sniff sniff — nice rug!', 'Wanna play?'],
    okay: ['Cozy nap mode', 'Soft stretch…', 'Still smiling'],
    sleepy: ['Dreaming of treats', 'Quiet cuddle time', 'Soft snooze'],
  },
  plant: {
    thriving: ['Leaves dancing!', 'Sunbeam approved!', 'Bloom vibes!'],
    happy: ['A little perk!', 'Loves this light', 'Gentle sway'],
    okay: ['Chillin’ green', 'Soft stretch leaf', 'Still growing'],
    sleepy: ['Night mode leaves', 'Quiet roots', 'Soft nap soil'],
  },
} as const

export const PARADE_GOAL = 12

export const CATEGORY_LABELS: Record<FurnitureCategory, string> = {
  cozy: 'Cozy',
  fun: 'Fun',
  garden: 'Garden',
  event: 'Parade',
}
