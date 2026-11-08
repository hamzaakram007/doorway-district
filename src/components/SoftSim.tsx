import type { SoftSim as SoftSimType } from '../data/types'
import type { GameApi } from '../hooks/useGame'

function vibeOf(mood: number) {
  if (mood > 80) return 'thriving'
  if (mood > 55) return 'happy'
  if (mood > 40) return 'okay'
  return 'sleepy'
}

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

  const vibe = sim.vibe ?? vibeOf(sim.mood)
  const emoji =
    sim.type === 'pet'
      ? vibe === 'thriving'
        ? '🐶'
        : vibe === 'sleepy'
          ? '😴'
          : '🐾'
      : vibe === 'thriving'
        ? '🌿'
        : vibe === 'sleepy'
          ? '🌱'
          : '🪴'

  return (
    <div className="panel sim-panel">
      <h3 className="section-title">{sim.name}</h3>
      <div className={`sim-card vibe-${vibe}`}>
        <div className={`sim-emoji ${vibe}`} aria-hidden>
          {emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>
            Feeling {vibe}
            {vibe === 'thriving' ? ' — loves your décor!' : ''}
          </div>
          <div className="mood-bar" aria-label={`Mood ${Math.round(sim.mood)}`}>
            <div className="mood-fill" style={{ width: `${sim.mood}%` }} />
          </div>
          {game.simBubble && <div className="sim-bubble">{game.simBubble}</div>}
        </div>
      </div>
      {editable && (
        <div className="dock" style={{ marginTop: 10 }}>
          <button className="btn small teal" onClick={game.careSim}>
            {sim.type === 'pet' ? 'Pet & play' : 'Water plant'}
          </button>
          <button className="btn small ghost" onClick={() => game.speakSim(sim)}>
            Say hi
          </button>
          <input
            className="name-input compact"
            value={sim.name}
            onChange={(e) => game.renameSim(e.target.value)}
            aria-label="Companion name"
          />
        </div>
      )}
    </div>
  )
}
