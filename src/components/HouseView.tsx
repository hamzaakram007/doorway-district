import { useRef } from 'react'
import {
  FLOOR_SWATCHES,
  FRIENDLY_NOTES,
  FURNITURE_DEFS,
  HOUSE_COLORS,
  ROOM_DEFS,
  WALL_SWATCHES,
} from '../data/catalog'
import type { GameApi } from '../hooks/useGame'
import { SoftSimCard } from './SoftSim'

export function HouseView({ game }: { game: GameApi }) {
  const {
    view,
    currentHouse,
    activeRoom,
    selectedItem,
    placing,
    goStreet,
    setActiveRoom,
    setPlacing,
    setSelectedItem,
    placeItemAt,
    moveItem,
    removeItem,
    paintRoom,
    addRoom,
    renameHouse,
    setHouseColor,
    leaveNote,
    save,
  } = game

  const dragId = useRef<string | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  if (view.name !== 'house' || !currentHouse || !activeRoom) return null

  const editing = view.mode === 'edit'
  const ownedKinds = new Set(currentHouse.rooms.map((r) => r.kind))

  const toPct = (clientX: number, clientY: number) => {
    const el = stageRef.current
    if (!el) return { x: 50, y: 50 }
    const rect = el.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    }
  }

  return (
    <div className="house-view">
      <div>
        <div className="dock" style={{ marginBottom: 10 }}>
          <button className="btn ghost small" onClick={goStreet}>
            ← Street
          </button>
          <span style={{ fontWeight: 800 }}>
            {editing ? 'Decorating' : 'Visiting'} {currentHouse.houseName}
          </span>
        </div>

        <div className="chip-row" style={{ marginBottom: 10 }}>
          {currentHouse.rooms.map((room) => {
            const def = ROOM_DEFS.find((d) => d.id === room.kind)
            return (
              <button
                key={room.id}
                className={`chip${room.id === activeRoom.id ? ' active' : ''}`}
                onClick={() => setActiveRoom(currentHouse.id, room.id)}
              >
                {def?.emoji} {room.name}
              </button>
            )
          })}
        </div>

        <div
          className="room-stage"
          ref={stageRef}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('.placed')) return
            const { x, y } = toPct(e.clientX, e.clientY)
            if (editing && placing) placeItemAt(x, y)
            else setSelectedItem(null)
          }}
          onPointerMove={(e) => {
            if (!dragId.current || !editing) return
            const { x, y } = toPct(e.clientX, e.clientY)
            moveItem(dragId.current, x, y)
          }}
          onPointerUp={() => {
            dragId.current = null
          }}
          onPointerLeave={() => {
            dragId.current = null
          }}
        >
          <div className="room-wall" style={{ background: activeRoom.wall }} />
          <div className="room-baseboard" />
          <div className="room-floor" style={{ background: activeRoom.floor }} />

          <div className="room-chrome">
            <div className="chip" style={{ pointerEvents: 'none' }}>
              {ROOM_DEFS.find((d) => d.id === activeRoom.kind)?.emoji} {activeRoom.name}
            </div>
            {placing && editing && (
              <div className="chip" style={{ background: '#fff1ea' }}>
                Tap room to place {FURNITURE_DEFS.find((f) => f.id === placing)?.name}
              </div>
            )}
          </div>

          {activeRoom.items.map((item) => {
            const def = FURNITURE_DEFS.find((f) => f.id === item.kind)!
            return (
              <div
                key={item.id}
                className={`placed${selectedItem === item.id ? ' selected' : ''}`}
                style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${def.w}%`, height: `${def.h}%` }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  setSelectedItem(item.id)
                  if (editing) {
                    dragId.current = item.id
                    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
                  }
                }}
                role="img"
                aria-label={def.name}
              >
                {def.emoji}
              </div>
            )
          })}
        </div>
      </div>

      <div className="side-panel">
        {editing && (
          <div className="panel">
            <h3 className="section-title">Your doorway</h3>
            <input
              className="name-input"
              value={currentHouse.houseName}
              onChange={(e) => renameHouse(e.target.value)}
              aria-label="House name"
            />
            <div className="swatches" style={{ marginTop: 10 }}>
              {HOUSE_COLORS.map((c) => (
                <button
                  key={c}
                  className={`swatch${currentHouse.color === c ? ' active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setHouseColor(c)}
                  aria-label={`Door color ${c}`}
                />
              ))}
            </div>
          </div>
        )}

        {editing && (
          <div className="panel">
            <h3 className="section-title">Furniture</h3>
            <div className="palette">
              {FURNITURE_DEFS.map((f) => (
                <button
                  key={f.id}
                  className={`palette-item${placing === f.id ? ' active' : ''}`}
                  onClick={() => setPlacing(placing === f.id ? null : f.id)}
                >
                  <span>{f.emoji}</span>
                  {f.name}
                </button>
              ))}
            </div>
            {selectedItem && (
              <button
                className="btn small"
                style={{ marginTop: 10 }}
                onClick={() => removeItem(selectedItem)}
              >
                Remove selected
              </button>
            )}
          </div>
        )}

        {editing && (
          <div className="panel">
            <h3 className="section-title">Paint & expand</h3>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Walls</div>
            <div className="swatches">
              {WALL_SWATCHES.map((c) => (
                <button
                  key={c}
                  className={`swatch${activeRoom.wall === c ? ' active' : ''}`}
                  style={{ background: c }}
                  onClick={() => paintRoom(c, undefined)}
                />
              ))}
            </div>
            <div style={{ fontWeight: 800, margin: '10px 0 6px' }}>Floors</div>
            <div className="swatches">
              {FLOOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  className={`swatch${activeRoom.floor === c ? ' active' : ''}`}
                  style={{ background: c }}
                  onClick={() => paintRoom(undefined, c)}
                />
              ))}
            </div>
            <div style={{ fontWeight: 800, margin: '12px 0 6px' }}>Add a room</div>
            <div className="chip-row">
              {ROOM_DEFS.filter((r) => !ownedKinds.has(r.id)).map((r) => (
                <button key={r.id} className="chip" onClick={() => addRoom(r.id)}>
                  {r.emoji} {r.name}
                </button>
              ))}
              {ROOM_DEFS.every((r) => ownedKinds.has(r.id)) && (
                <span style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>All rooms unlocked!</span>
              )}
            </div>
          </div>
        )}

        <SoftSimCard sim={currentHouse.sim} editable={editing} game={game} />

        {!editing && (
          <div className="panel">
            <h3 className="section-title">Leave a friendly note</h3>
            <p style={{ marginTop: 0 }}>Canned stickers only — no open chat.</p>
            <div className="note-picker">
              {FRIENDLY_NOTES.map((n) => (
                <button
                  key={n.id}
                  className="btn small"
                  onClick={() => leaveNote(currentHouse.id, n.id)}
                >
                  {n.emoji} {n.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="panel">
          <h3 className="section-title">Notes on the fridge</h3>
          <div className="notes-list">
            {currentHouse.notes.length === 0 && (
              <div style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>No notes yet.</div>
            )}
            {currentHouse.notes.map((note) => {
              const def = FRIENDLY_NOTES.find((n) => n.id === note.noteId)
              return (
                <div className="note" key={note.id}>
                  <span>{def?.emoji ?? '💌'}</span>
                  <div>
                    <strong>{note.from}</strong>: {def?.label ?? 'Hello!'}
                  </div>
                </div>
              )
            })}
            {editing && save.lastVisit && (
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-soft)' }}>
                Tip: visit a friend, leave a note, then check back here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
