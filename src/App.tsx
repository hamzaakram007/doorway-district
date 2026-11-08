import { HouseView } from './components/HouseView'
import { InviteModal } from './components/InviteModal'
import { ShareModal } from './components/ShareModal'
import { StreetView } from './components/StreetView'
import { useGame } from './hooks/useGame'
import './styles/app.css'

export default function App() {
  const game = useGame()

  return (
    <div className="app">
      <div className="sky-layer" aria-hidden>
        <div className="sun" />
        <div className="cloud a" />
        <div className="cloud b" />
        <div className="cloud c" />
      </div>

      <header className="topbar">
        <div className="brand">
          <h1>Doorway District</h1>
          <p>Kid-safe street · decorate · visit · parade</p>
        </div>
        <div className="top-actions">
          {game.view.name !== 'street' && (
            <button className="btn ghost small" onClick={game.goStreet}>
              Street
            </button>
          )}
          <button className="btn small teal" onClick={() => game.setView({ name: 'invite' })}>
            Friends
          </button>
          <button className="btn small" onClick={() => game.setView({ name: 'share' })}>
            Codes
          </button>
        </div>
      </header>

      <main className="main">
        {game.view.name === 'street' && <StreetView game={game} />}
        {game.view.name === 'house' && <HouseView game={game} />}
      </main>

      <footer className="footer">
        <span>Saved on this device · closed circle · sticker notes only</span>
        <button className="btn ghost small" onClick={game.resetGame}>
          Reset street
        </button>
      </footer>

      {game.view.name === 'invite' && <InviteModal game={game} />}
      {game.view.name === 'share' && <ShareModal game={game} />}
      {game.toast && (
        <div className="toast" role="status">
          {game.toast}
        </div>
      )}
    </div>
  )
}
