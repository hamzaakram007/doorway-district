import { useRef } from 'react'
import {
  CATEGORY_LABELS,
  FLOOR_SWATCHES,
  FRIENDLY_NOTES,
  FURNITURE_DEFS,
  HOUSE_COLORS,
  ROOM_DEFS,
  THEME_PACKS,
  WALL_SWATCHES,
  type FurnitureCategory,
} from '../data/catalog'
import type { GameApi } from '../hooks/useGame'
import { SoftSimCard } from './SoftSim'

const FILTERS: Array<FurnitureCategory | 'all'> = ['all', 'cozy', 'fun', 'garden', 'event']

export function HouseView({ game }: { game: GameApi }) {
  const {
    view,
    currentHouse,
    activeRoom,
    selectedItem,
    placing,
    furnitureFilter,
    ghost,
    goStreet,
    setActiveRoom,
    setPlacing,
    setSelectedItem,
    setFurnitureFilter,
    setGhost,
    placeItemAt,
    moveItem,
    rotateSelected,
    removeItem,
    paintRoom,
    applyTheme,
    addRoom,
    renameHouse,
    setHouseColor,
    leaveNote,
    undoPlace,
    toggleSnap,
    save,
  } = game

  const dragId = useRef<string | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  if (view.name !== 'house' || !currentHouse || !activeRoom) return null

  const editing = view.mode === 'edit'
  const ownedKinds = new Set(currentHouse.rooms.map((r) => r.kind))
  const palette = FURNITURE_DEFS.filter(
    (f) => furnitureFilter === 'all' || f.category === furnitureFilter,
  )

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
          {editing && (
            <>
              <button className={`chip${save.snapGrid ? ' active' : ''}`} onClick={toggleSnap}>
                Snap {save.snapGrid ? 'on' : 'off'}
              </button>
              <button className="chip" onClick={undoPlace}>
                Undo
              </button>
            </>
          )}
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
          className={`room-stage${placing && editing ? ' placing' : ''}`}
          ref={stageRef}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('.placed')) return
            const { x, y } = toPct(e.clientX, e.clientY)
            if (editing && placing) placeItemAt(x, y)
            else setSelectedItem(null)
          }}
          onPointerMove={(e) => {
            const { x, y } = toPct(e.clientX, e.clientY)
            if (editing && placing) setGhost({ x, y })
            if (!dragId.current || !editing) return
            moveItem(dragId.current, x, y)
          }}
          onPointerUp={() => {
            dragId.current = null
          }}
          onPointerLeave={() => {
            dragId.current = null
            setGhost(null)
          }}
        >
          <div className="room-wall" style={{ background: activeRoom.wall }} />
          <div className="room-baseboard" />
          <div className="room-floor" style={{ background: activeRoom.floor }} />
          {save.snapGrid && editing && <div className="grid-overlay" aria-hidden />}

          <div className="room-chrome">
            <div className="chip" style={{ pointerEvents: 'none' }}>
              {ROOM_DEFS.find((d) => d.id === activeRoom.kind)?.emoji} {activeRoom.name}
              {activeRoom.themeId
                ? ` · ${THEME_PACKS.find((t) => t.id === activeRoom.themeId)?.name ?? ''}`
                : ''}
            </div>
            {placing && editing && (
              <div className="chip place-hint">
                Tap to place {FURNITURE_DEFS.find((f) => f.id === placing)?.name}
              </div>
            )}
          </div>

          {ghost && placing && editing && (
            <div
              className="placed ghost"
              style={{
                left: `${ghost.x}%`,
                top: `${ghost.y}%`,
                width: `${FURNITURE_DEFS.find((f) => f.id === placing)?.w ?? 10}%`,
                height: `${FURNITURE_DEFS.find((f) => f.id === placing)?.h ?? 10}%`,
              }}
              aria-hidden
            >
              {FURNITURE_DEFS.find((f) => f.id === placing)?.emoji}
            </div>
          )}

          {activeRoom.items.map((item) => {
            const def = FURNITURE_DEFS.find((f) => f.id === item.kind)!
            const rot = item.rot ?? 0
            return (
              <div
                key={item.id}
                className={`placed${selectedItem === item.id ? ' selected' : ''} pop-in`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${def.w}%`,
                  height: `${def.h}%`,
                  transform: `translate(-50%, -50%) rotate(${rot}deg)${
                    selectedItem === item.id ? ' scale(1.08)' : ''
                  }`,
                }}
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
            <div className="chip-row" style={{ marginBottom: 8 }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`chip${furnitureFilter === f ? ' active' : ''}`}
                  onClick={() => setFurnitureFilter(f)}
                >
                  {f === 'all' ? 'All' : CATEGORY_LABELS[f]}
                </button>
              ))}
            </div>
            <div className="palette">
              {palette.map((f) => (
                <button
                  key={f.id}
                  className={`palette-item${placing === f.id ? ' active' : ''}`}
                  onClick={() => {
                    setPlacing(placing === f.id ? null : f.id)
                    setGhost(null)
                  }}
                >
                  <span>{f.emoji}</span>
                  {f.name}
                  {f.eventBoost ? <em className="boost">+{f.eventBoost}</em> : null}
                </button>
              ))}
            </div>
            {selectedItem && (
              <div className="dock" style={{ marginTop: 10 }}>
                <button className="btn small" onClick={rotateSelected}>
                  Rotate
                </button>
                <button className="btn small" onClick={() => removeItem(selectedItem)}>
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {editing && (
          <div className="panel">
            <h3 className="section-title">Themes & paint</h3>
            <div className="theme-grid">
              {THEME_PACKS.map((t) => (
                <button key={t.id} className="theme-card" onClick={() => applyTheme(t.id)}>
                  <span>{t.emoji}</span>
                  <strong>{t.name}</strong>
                  <i style={{ background: `linear-gradient(90deg, ${t.wall}, ${t.floor})` }} />
                </button>
              ))}
            </div>
            <div style={{ fontWeight: 800, margin: '10px 0 6px' }}>Walls</div>
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
          </div>
        </div>
      </div>
    </div>
  )
}
