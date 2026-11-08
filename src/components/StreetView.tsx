import type { GameApi } from '../hooks/useGame'

export function StreetView({ game }: { game: GameApi }) {
  const { houses, save, enterHouse, setView, decorationScore } = game

  return (
    <div className="street">
      {save.streetEvent === 'parade' && (
        <div className="street-event" role="status">
          <span aria-hidden>🎉</span> Street parade weekend — decorate your porch!
        </div>
      )}

      <div className="houses-row">
        {houses.map((house) => {
          const invited = house.isPlayer || save.invited.includes(house.id)
          return (
            <button
              key={house.id}
              className="house-card"
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
                <div
                  className="house-roof"
                  style={{ borderBottomColor: shade(house.color, -28) }}
                />
                <div className="house-body">
                  <div className="house-window l" />
                  <div className="house-window r" />
                  <div className="house-door" style={{ background: house.color }} />
                </div>
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

      <div className="panel">
        <h2>Welcome to Doorway District</h2>
        <p>
          Build your house, decorate rooms, then invite approved friends over. No
          strangers. No open chat — just friendly notes.
        </p>
        <div className="quick-tips">
          <div className="tip">
            <span>🚪</span>
            <div>Tap your house to place furniture — saves instantly.</div>
          </div>
          <div className="tip">
            <span>💌</span>
            <div>Invite Mia, Jay, or Sam, then visit their rooms.</div>
          </div>
          <div className="tip">
            <span>🪴</span>
            <div>
              Soft pet/plant reacts when you decorate ({decorationScore} pieces so far).
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
