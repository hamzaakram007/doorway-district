import { HouseView } from './components/HouseView'
import { InviteModal } from './components/InviteModal'
import { StreetView } from './components/StreetView'
import { useGame } from './hooks/useGame'
import './styles/app.css'

export default function App() {
  const game = useGame()

  return (
    <div className="app">
      <div className="sky-layer" aria-hidden>
        <div className="cloud a" />
        <div className="cloud b" />
      </div>

      <header className="topbar">
        <div className="brand">
          <h1>Doorway District</h1>
          <p>Kid-safe street · decorate · visit friends</p>
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
        </div>
      </header>

      <main className="main">
        {game.view.name === 'street' && <StreetView game={game} />}
        {game.view.name === 'house' && <HouseView game={game} />}
      </main>

      <footer className="footer">
        <span>Saved on this device · friends are simulated sample houses</span>
        <button className="btn ghost small" onClick={game.resetGame}>
          Reset street
        </button>
      </footer>

      {game.view.name === 'invite' && <InviteModal game={game} />}
      {game.toast && (
        <div className="toast" role="status">
          {game.toast}
        </div>
      )}
    </div>
  )
}
