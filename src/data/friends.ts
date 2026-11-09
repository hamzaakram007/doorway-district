import type { HouseState, RoomState, SoftSim } from './types'
import { HOUSE_COLORS, ROOM_DEFS } from './catalog'
import type { FurnitureKind, RoomKind } from './catalog'

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

function item(kind: FurnitureKind, x: number, y: number, rot?: 0 | 90 | 180 | 270) {
  return { id: uid('item'), kind, x, y, rot: rot ?? 0 }
}

export function makeStarterHouse(
  ownerName: string,
  houseName: string,
  color: string,
  isPlayer = false,
): HouseState {
  const living = makeRoom('living', {
    items: [
      item('sofa', 28, 48),
      item('lamp', 62, 42),
      item('plant', 12, 55),
      item('rug', 36, 62),
    ],
  })
  const porch = makeRoom('porch', {
    items: [item('lantern', 22, 45), item('chair', 55, 58), item('plant', 72, 50)],
  })
  return {
    id: isPlayer ? 'player-house' : uid('house'),
    ownerName,
    houseName,
    color,
    rooms: [living, porch],
    activeRoomId: living.id,
    sim: isPlayer
      ? ({ type: 'plant', name: 'Sprout', mood: 78, lastCare: Date.now(), vibe: 'happy', energy: 70 } satisfies SoftSim)
      : null,
    notes: [],
    isPlayer,
    code: isPlayer ? 'MYDOOR' : undefined,
  }
}

export function makeFriendHouses(): HouseState[] {
  const miaLiving = makeRoom('living', {
    wall: '#ffe0d4',
    floor: '#b8895a',
    themeId: 'ember',
    items: [
      item('sofa', 35, 50),
      item('art', 55, 28),
      item('lamp', 15, 40),
      item('toybox', 70, 58),
      item('balloon', 80, 30),
    ],
  })
  const miaGarden = makeRoom('garden', {
    items: [
      item('plant', 25, 45),
      item('fountain', 50, 50),
      item('chair', 70, 55),
      item('swing', 18, 58),
    ],
  })
  const miaPorch = makeRoom('porch', {
    items: [item('banner', 40, 35), item('lantern', 65, 48), item('floatpiece', 25, 55)],
  })

  const jayBedroom = makeRoom('bedroom', {
    themeId: 'tide',
    wall: '#dceefc',
    items: [
      item('bed', 30, 45),
      item('bookshelf', 70, 40),
      item('window', 12, 28),
      item('lamp', 55, 38),
      item('pillow', 42, 58),
    ],
  })
  const jayStudio = makeRoom('studio', {
    items: [
      item('desk', 40, 48),
      item('chair', 55, 55),
      item('art', 20, 30),
      item('bookshelf', 75, 42),
      item('piano', 18, 55),
    ],
  })
  const jayAttic = makeRoom('attic', {
    items: [item('hammock', 40, 50), item('lantern', 70, 35), item('toybox', 20, 55)],
  })

  const samKitchen = makeRoom('kitchen', {
    items: [
      item('table', 40, 50),
      item('chair', 28, 55),
      item('chair', 55, 55),
      item('plant', 72, 40),
      item('window', 15, 28),
      item('fridge', 78, 48),
    ],
  })
  const samLiving = makeRoom('living', {
    wall: '#c8e8f0',
    themeId: 'tide',
    items: [
      item('sofa', 25, 48),
      item('rug', 40, 62),
      item('lamp', 68, 40),
      item('curtain', 12, 30),
    ],
  })

  const rioPorch = makeRoom('porch', {
    themeId: 'parade',
    wall: '#ffe8a8',
    items: [
      item('floatpiece', 40, 50),
      item('balloon', 20, 35),
      item('balloon', 70, 38),
      item('banner', 50, 28),
      item('lantern', 30, 55),
    ],
  })
  const rioLiving = makeRoom('living', {
    items: [item('sofa', 32, 50), item('piano', 65, 45), item('rug', 40, 62), item('art', 18, 30)],
  })

  const tessGarden = makeRoom('garden', {
    themeId: 'grove',
    items: [
      item('hammock', 35, 48),
      item('fountain', 60, 52),
      item('plant', 18, 55),
      item('plant', 78, 45),
      item('swing', 48, 62),
    ],
  })
  const tessBath = makeRoom('bath', {
    items: [item('bathtub', 40, 50), item('mirror', 70, 35), item('plant', 20, 55), item('stool', 55, 60)],
  })
  const tessLiving = makeRoom('living', {
    wall: '#d5ecc8',
    items: [item('sofa', 28, 48), item('bookshelf', 70, 42), item('lamp', 50, 40)],
  })

  const omarStudio = makeRoom('studio', {
    themeId: 'ink',
    wall: '#e8eef2',
    items: [
      item('desk', 38, 48),
      item('chair', 52, 55),
      item('art', 18, 28),
      item('art', 70, 30),
      item('bookshelf', 80, 50),
      item('stool', 25, 58),
    ],
  })
  const omarAttic = makeRoom('attic', {
    items: [item('bed', 30, 48), item('lantern', 65, 35), item('pillow', 55, 58), item('toybox', 15, 55)],
  })
  const omarPorch = makeRoom('porch', {
    items: [item('chair', 40, 55), item('lantern', 65, 45), item('banner', 25, 35)],
  })

  return [
    {
      id: 'friend-mia',
      ownerName: 'Mia',
      houseName: "Mia's Nest",
      color: HOUSE_COLORS[1],
      rooms: [miaLiving, miaGarden, miaPorch],
      activeRoomId: miaLiving.id,
      sim: { type: 'pet', name: 'Bean', mood: 88, lastCare: Date.now(), vibe: 'thriving', energy: 80 },
      notes: [{ id: uid('note'), from: 'Sam', noteId: 'stars', at: Date.now() - 86400000 }],
      isPlayer: false,
      code: 'MIANEST',
    },
    {
      id: 'friend-jay',
      ownerName: 'Jay',
      houseName: 'Sky Loft',
      color: HOUSE_COLORS[6],
      rooms: [jayBedroom, jayStudio, jayAttic],
      activeRoomId: jayBedroom.id,
      sim: { type: 'plant', name: 'Pebble', mood: 72, lastCare: Date.now(), vibe: 'happy', energy: 65 },
      notes: [],
      isPlayer: false,
      code: 'SKYLOFT',
    },
    {
      id: 'friend-sam',
      ownerName: 'Sam',
      houseName: 'Sunny Porch',
      color: HOUSE_COLORS[2],
      rooms: [samKitchen, samLiving],
      activeRoomId: samKitchen.id,
      sim: { type: 'pet', name: 'Noodle', mood: 80, lastCare: Date.now(), vibe: 'happy', energy: 75 },
      notes: [{ id: uid('note'), from: 'Mia', noteId: 'snack', at: Date.now() - 3600000 }],
      isPlayer: false,
      code: 'SUNPORCH',
    },
    {
      id: 'friend-rio',
      ownerName: 'Rio',
      houseName: 'Parade Pad',
      color: HOUSE_COLORS[4],
      rooms: [rioPorch, rioLiving],
      activeRoomId: rioPorch.id,
      sim: { type: 'pet', name: 'Confetti', mood: 92, lastCare: Date.now(), vibe: 'thriving', energy: 90 },
      notes: [{ id: uid('note'), from: 'Tess', noteId: 'parade', at: Date.now() - 7200000 }],
      isPlayer: false,
      code: 'PARADEPAD',
    },
    {
      id: 'friend-tess',
      ownerName: 'Tess',
      houseName: 'Moss Cottage',
      color: HOUSE_COLORS[3],
      rooms: [tessGarden, tessBath, tessLiving],
      activeRoomId: tessGarden.id,
      sim: { type: 'plant', name: 'Fernie', mood: 85, lastCare: Date.now(), vibe: 'thriving', energy: 70 },
      notes: [{ id: uid('note'), from: 'Rio', noteId: 'plant', at: Date.now() - 5400000 }],
      isPlayer: false,
      code: 'MOSSCOTT',
    },
    {
      id: 'friend-omar',
      ownerName: 'Omar',
      houseName: 'Sketch House',
      color: HOUSE_COLORS[5],
      rooms: [omarStudio, omarAttic, omarPorch],
      activeRoomId: omarStudio.id,
      sim: { type: 'pet', name: 'Inkspot', mood: 76, lastCare: Date.now(), vibe: 'happy', energy: 68 },
      notes: [],
      isPlayer: false,
      code: 'SKETCHHQ',
    },
  ]
}

/** Known demo codes that unlock neighbor visits without invite flow */
export const DEMO_HOUSE_CODES: Record<string, string> = {
  MIANEST: 'friend-mia',
  SKYLOFT: 'friend-jay',
  SUNPORCH: 'friend-sam',
  PARADEPAD: 'friend-rio',
  MOSSCOTT: 'friend-tess',
  SKETCHHQ: 'friend-omar',
}

export function roomKindLabel(kind: RoomKind) {
  return ROOM_DEFS.find((r) => r.id === kind)?.name ?? kind
}

export { uid }
