import type { GameApi } from '../hooks/useGame'

export function InviteModal({ game }: { game: GameApi }) {
  const { save, inviteFriend, setView, enterHouse } = game

  return (
    <div className="modal-backdrop" onClick={() => setView({ name: 'street' })}>
      <div
        className="modal"
        role="dialog"
        aria-labelledby="invite-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="invite-title">Friends & family only</h2>
        <p style={{ marginTop: 0, color: 'var(--ink-soft)', fontWeight: 700 }}>
          Simulated invites for this MVP — no open chat, no strangers.
        </p>

        {save.friends.map((friend) => {
          const invited = save.invited.includes(friend.id)
          return (
            <div className="friend-row" key={friend.id}>
              <div>
                <strong>{friend.ownerName}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                  {friend.houseName}
                </div>
              </div>
              {invited ? (
                <button className="btn small teal" onClick={() => enterHouse(friend.id)}>
                  Visit
                </button>
              ) : (
                <button className="btn small primary" onClick={() => inviteFriend(friend.id)}>
                  Invite
                </button>
              )}
            </div>
          )
        })}

        <div className="safe-note">
          Kid-safe by design: canned friendly notes only. Parents can understand the
          closed street.
        </div>

        <div className="dock" style={{ marginTop: 14, justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={() => setView({ name: 'street' })}>
            Back to street
          </button>
        </div>
      </div>
    </div>
  )
}
