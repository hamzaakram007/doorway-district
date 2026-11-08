import { useState } from 'react'
import { DEMO_HOUSE_CODES } from '../data/friends'
import type { GameApi } from '../hooks/useGame'

export function ShareModal({ game }: { game: GameApi }) {
  const { setView, copyShareLink, importHouseCode, myShareCode, save } = game
  const [codeIn, setCodeIn] = useState('')

  return (
    <div className="modal-backdrop" onClick={() => setView({ name: 'street' })}>
      <div
        className="modal"
        role="dialog"
        aria-labelledby="share-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="share-title">House codes & links</h2>
        <p style={{ marginTop: 0, color: 'var(--ink-soft)', fontWeight: 700 }}>
          Share your doorway with friends — no open chat. Paste a code or short name to visit.
        </p>

        <div className="panel nested">
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Your share link</div>
          <code className="code-block">{myShareCode.slice(0, 42)}…</code>
          <div className="dock" style={{ marginTop: 10 }}>
            <button className="btn small primary" onClick={() => void copyShareLink()}>
              Copy share link
            </button>
          </div>
        </div>

        <div className="panel nested" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Visit with a code</div>
          <input
            className="name-input"
            placeholder="e.g. MIANEST or DD1.…"
            value={codeIn}
            onChange={(e) => setCodeIn(e.target.value)}
            aria-label="House code"
          />
          <div className="dock" style={{ marginTop: 10 }}>
            <button
              className="btn small teal"
              onClick={() => {
                if (importHouseCode(codeIn)) setView({ name: 'street' })
              }}
            >
              Open house
            </button>
          </div>
          <div className="chip-row" style={{ marginTop: 10 }}>
            {Object.keys(DEMO_HOUSE_CODES).map((c) => (
              <button
                key={c}
                className="chip"
                onClick={() => {
                  importHouseCode(c)
                  setView({ name: 'street' })
                }}
              >
                {c}
              </button>
            ))}
          </div>
          {save.importedCodes.length > 0 && (
            <div style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-soft)' }}>
              Unlocked: {save.importedCodes.slice(0, 6).join(', ')}
            </div>
          )}
        </div>

        <div className="safe-note">
          Codes open sample or shared houses only. Kids leave sticker notes — never free chat.
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
