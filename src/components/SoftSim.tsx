import type { SoftSim as SoftSimType } from '../data/types'
import type { GameApi } from '../hooks/useGame'

export function SoftSimCard({
  sim,
  editable,
  game,
}: {
  sim: SoftSimType | null
  editable: boolean
  game: GameApi
}) {
  if (!sim) {
    if (!editable) return null
    return (
      <div className="panel">
        <h3 className="section-title">Soft companion</h3>
        <p style={{ marginTop: 0 }}>Optional pet or plant — light care, never punishing.</p>
        <div className="dock">
          <button className="btn small teal" onClick={() => game.setSim('pet')}>
            Adopt a pet
          </button>
          <button className="btn small" onClick={() => game.setSim('plant')}>
            Grow a plant
          </button>
        </div>
      </div>
    )
  }

  const emoji = sim.type === 'pet' ? (sim.mood > 50 ? '🐶' : '🐾') : sim.mood > 50 ? '🌿' : '🌱'
  const vibe =
    sim.mood > 80 ? 'thriving' : sim.mood > 50 ? 'happy' : sim.mood > 25 ? 'okay' : 'sleepy'

  return (
    <div className="panel">
      <h3 className="section-title">{sim.name}</h3>
      <div className="sim-card">
        <div className="sim-emoji" aria-hidden>
          {emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>
            Feeling {vibe}
            {sim.mood > 70 && sim.type === 'plant' ? ' — loves your décor!' : ''}
          </div>
          <div className="mood-bar" aria-label={`Mood ${sim.mood}`}>
            <div className="mood-fill" style={{ width: `${sim.mood}%` }} />
          </div>
        </div>
      </div>
      {editable && (
        <button className="btn small teal" style={{ marginTop: 10 }} onClick={game.careSim}>
          {sim.type === 'pet' ? 'Pet & play' : 'Water plant'}
        </button>
      )}
    </div>
  )
}
