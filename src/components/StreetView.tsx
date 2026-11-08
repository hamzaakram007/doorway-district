import type { GameApi } from '../hooks/useGame'

export function StreetView({ game }: { game: GameApi }) {
  const { houses, save, enterHouse, setView, decorationScore, playerEventScore, contributeParade } =
    game
  const event = save.streetEvent
  const pct = Math.round((event.progress / event.goal) * 100)

  return (
    <div className="street">
      <div className={`street-event-card${event.completed ? ' done' : ''}`} role="status">
        <div className="parade-float" aria-hidden>
          <span className="float-body">🎪</span>
          <span className="float-spark a">✨</span>
          <span className="float-spark b">🎈</span>
        </div>
        <div className="event-copy">
          <strong>{event.title}</strong>
          <p>
            {event.completed
              ? 'The street float is ready — neighbors cheer!'
              : 'Place parade pieces or leave visit notes to build the float together.'}
          </p>
          <div className="event-bar" aria-label={`Parade progress ${pct}%`}>
            <div className="event-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="event-meta">
            <span>
              {event.progress}/{event.goal} float bits
            </span>
            <span>Your parade décor: {playerEventScore}</span>
          </div>
          {!event.completed && (
            <button className="btn small primary" onClick={contributeParade}>
              Cheer the float (+your décor)
            </button>
          )}
        </div>
      </div>

      <div className="houses-row">
        {houses.map((house, i) => {
          const invited = house.isPlayer || save.invited.includes(house.id)
          return (
            <button
              key={house.id}
              className="house-card"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => {
                if (!invited && !house.isPlayer) {
                  game.flash('Invite them first — friends & family only')
                  setView({ name: 'invite' })
                  return
                }
                enterHouse(house.id)
              }}
              aria-label={`${house.isPlayer ? 'Enter' : 'Visit'} ${house.houseName}`}
            >
              <div className="house-visual">
                {house.isPlayer && <span className="badge">Yours</span>}
                {!house.isPlayer && invited && <span className="badge">Friend</span>}
                {!house.isPlayer && !invited && <span className="badge">Invite?</span>}
                <div className="house-roof" style={{ borderBottomColor: shade(house.color, -28) }} />
                <div className="house-body">
                  <div className="house-window l" />
                  <div className="house-window r" />
                  <div className="house-door" style={{ background: house.color }} />
                </div>
                {event.completed && house.isPlayer && (
                  <div className="porch-banner" aria-hidden>
                    🎊
                  </div>
                )}
              </div>
              <div className="house-label">
                <strong>{house.houseName}</strong>
                <span>
                  {house.ownerName} · {house.rooms.length} room
                  {house.rooms.length === 1 ? '' : 's'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="panel welcome-panel">
        <h2>Welcome to Doorway District</h2>
        <p>
          Build rooms, paint themes, then invite neighbors or open a house code. Soft companions
          react — never punish. No strangers. No open chat.
        </p>
        <div className="quick-tips">
          <div className="tip">
            <span>🚪</span>
            <div>Tap your house — snap-place furniture, rotate, undo.</div>
          </div>
          <div className="tip">
            <span>🔗</span>
            <div>Share a house link or try codes like MIANEST / PARADEPAD.</div>
          </div>
          <div className="tip">
            <span>🪴</span>
            <div>
              Soft pet/plant stays cheerful ({decorationScore} pieces · mood soft-floored).
            </div>
          </div>
        </div>
        <div className="dock" style={{ marginTop: 14 }}>
          <button className="btn primary" onClick={() => enterHouse(save.player.id)}>
            Decorate my house
          </button>
          <button className="btn teal" onClick={() => setView({ name: 'invite' })}>
            Invite friends
          </button>
          <button className="btn ghost" onClick={() => setView({ name: 'share' })}>
            House codes
          </button>
        </div>
      </div>
    </div>
  )
}

function shade(hex: string, amount: number) {
  const n = hex.replace('#', '')
  const num = parseInt(n, 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
