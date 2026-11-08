import type { HouseState, RoomState } from './types'
import { HOUSE_COLORS, ROOM_DEFS } from './catalog'

function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function makeRoom(kind: RoomState['kind'], extras?: Partial<RoomState>): RoomState {
  const def = ROOM_DEFS.find((r) => r.id === kind)!
  return {
    id: uid('room'),
    kind,
    name: def.name,
    wall: def.wall,
    floor: def.floor,
    items: [],
    ...extras,
  }
}

export function makeStarterHouse(ownerName: string, houseName: string, color: string, isPlayer = false): HouseState {
  const living = makeRoom('living', {
    items: [
      { id: uid('item'), kind: 'sofa', x: 28, y: 48 },
      { id: uid('item'), kind: 'lamp', x: 62, y: 42 },
      { id: uid('item'), kind: 'plant', x: 12, y: 55 },
      { id: uid('item'), kind: 'rug', x: 36, y: 62 },
    ],
  })
  return {
    id: uid('house'),
    ownerName,
    houseName,
    color,
    rooms: [living],
    activeRoomId: living.id,
    sim: isPlayer
      ? { type: 'plant', name: 'Sprout', mood: 70, lastCare: Date.now() }
      : null,
    notes: [],
    isPlayer,
  }
}

export function makeFriendHouses(): HouseState[] {
  const miaLiving = makeRoom('living', {
    wall: '#ffe8ef',
    floor: '#c4a574',
    items: [
      { id: uid('item'), kind: 'sofa', x: 35, y: 50 },
      { id: uid('item'), kind: 'art', x: 55, y: 28 },
      { id: uid('item'), kind: 'lamp', x: 15, y: 40 },
      { id: uid('item'), kind: 'toybox', x: 70, y: 58 },
    ],
  })
  const miaGarden = makeRoom('garden', {
    items: [
      { id: uid('item'), kind: 'plant', x: 25, y: 45 },
      { id: uid('item'), kind: 'fountain', x: 50, y: 50 },
      { id: uid('item'), kind: 'chair', x: 70, y: 55 },
    ],
  })

  const jayBedroom = makeRoom('bedroom', {
    items: [
      { id: uid('item'), kind: 'bed', x: 30, y: 45 },
      { id: uid('item'), kind: 'bookshelf', x: 70, y: 40 },
      { id: uid('item'), kind: 'window', x: 12, y: 28 },
      { id: uid('item'), kind: 'lamp', x: 55, y: 38 },
    ],
  })
  const jayStudio = makeRoom('studio', {
    items: [
      { id: uid('item'), kind: 'table', x: 40, y: 48 },
      { id: uid('item'), kind: 'chair', x: 55, y: 55 },
      { id: uid('item'), kind: 'art', x: 20, y: 30 },
      { id: uid('item'), kind: 'bookshelf', x: 75, y: 42 },
    ],
  })

  const samKitchen = makeRoom('kitchen', {
    items: [
      { id: uid('item'), kind: 'table', x: 40, y: 50 },
      { id: uid('item'), kind: 'chair', x: 28, y: 55 },
      { id: uid('item'), kind: 'chair', x: 55, y: 55 },
      { id: uid('item'), kind: 'plant', x: 72, y: 40 },
      { id: uid('item'), kind: 'window', x: 15, y: 28 },
    ],
  })
  const samLiving = makeRoom('living', {
    wall: '#d6e8ff',
    items: [
      { id: uid('item'), kind: 'sofa', x: 25, y: 48 },
      { id: uid('item'), kind: 'rug', x: 40, y: 62 },
      { id: uid('item'), kind: 'lamp', x: 68, y: 40 },
    ],
  })

  return [
    {
      id: 'friend-mia',
      ownerName: 'Mia',
      houseName: "Mia's Nest",
      color: HOUSE_COLORS[1],
      rooms: [miaLiving, miaGarden],
      activeRoomId: miaLiving.id,
      sim: { type: 'pet', name: 'Bean', mood: 85, lastCare: Date.now() },
      notes: [
        {
          id: uid('note'),
          from: 'Sam',
          noteId: 'stars',
          at: Date.now() - 86400000,
        },
      ],
      isPlayer: false,
    },
    {
      id: 'friend-jay',
      ownerName: 'Jay',
      houseName: 'Sky Loft',
      color: HOUSE_COLORS[3],
      rooms: [jayBedroom, jayStudio],
      activeRoomId: jayBedroom.id,
      sim: { type: 'plant', name: 'Pebble', mood: 60, lastCare: Date.now() },
      notes: [],
      isPlayer: false,
    },
    {
      id: 'friend-sam',
      ownerName: 'Sam',
      houseName: 'Sunny Porch',
      color: HOUSE_COLORS[2],
      rooms: [samKitchen, samLiving],
      activeRoomId: samKitchen.id,
      sim: { type: 'pet', name: 'Noodle', mood: 75, lastCare: Date.now() },
      notes: [
        {
          id: uid('note'),
          from: 'Mia',
          noteId: 'snack',
          at: Date.now() - 3600000,
        },
      ],
      isPlayer: false,
    },
  ]
}

export { uid }
