import { useState } from "react";
import {
  Clock3,
  UsersRound,
  Trophy,
  ListOrdered,
  RotateCcw,
  Play,
  Trash2,
  Shuffle,
  Check,
  ChevronRight,
} from "lucide-react";
import { motion as Motion } from "motion/react";
import Cup from "./components/Cup";
import ResetDialog from "./components/ResetDialog";
import { useGame } from "./hooks/useGame";
import { parseNames, validateGame } from "./utils/game";
import closedCup from "./assets/images/cup_close.png";
import openCup from "./assets/images/cup_opne.png";
import "./App.css";

const examples =
  "Juan Dela Cruz\nMaria Santos\nPedro Reyes\nAnna Lopez\nCarlos Mendoza\nIsabelle Garcia";

function App() {
  const [input, setInput] = useState(examples);
  const [duration, setDuration] = useState(5);
  const [showReset, setShowReset] = useState(false);
  const { game, start, reset, soundUnavailable } = useGame();
  const names = parseNames(input);
  const error = validateGame(names, duration);
  const phase = game.phase === "setup" && !error ? "ready" : game.phase;
  const busy = ["shuffling", "stopping", "drumroll", "revealing"].includes(phase);
  const finished = phase === "finished";
  const count = game.order.length || names.length;
  const display = game.order.length
    ? game.display
    : names.slice(0, 12).map((_, i) => i);
  const status = {
    setup: "Add your participants to get started",
    ready: "Ready when you are!",
    shuffling: "Shuffling Cups...",
    stopping: "Slowing down...",
    drumroll: "Drum roll... The cups open when the sound finishes.",
    revealing: "Revealing the order...",
    finished: "Game Complete!",
  }[phase];
  function editInput(value) {
    reset();
    setInput(value);
  }
  function editDuration(value) {
    reset();
    setDuration(value);
  }
  function resetAll() {
    reset();
    setInput("");
    setDuration(5);
    setShowReset(false);
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div className="brand">
          <div className="brand-icon">
            <img src={closedCup} alt="" />
          </div>
          <div>
            <h1>
              Random Name <span>Cup Game</span>
            </h1>
            <p>Add names, set the timer, and let the cups decide the order!</p>
          </div>
        </div>
        <button className="reset-button" onClick={() => setShowReset(true)}>
          <RotateCcw size={17} /> Reset Game
        </button>
      </header>
      <section className="configuration" aria-label="Game setup">
        <section className="card timer-card">
          <div className="section-heading">
            <Clock3 />
            <div>
              <h2>
                <label htmlFor="duration">Timer Settings</label>
              </h2>
              <p>Set how long the cups will shuffle</p>
            </div>
          </div>
          <div className="timer-input">
            <input
              id="duration"
              type="number"
              min="3"
              max="30"
              step="1"
              value={duration}
              disabled={busy}
              onChange={(event) => editDuration(event.target.value)}
              aria-describedby="timer-help"
            />
            <span>seconds</span>
          </div>
          <div className="presets">
            {[5, 10, 15, 20, 30].map((seconds) => (
              <button
                key={seconds}
                disabled={busy}
                aria-pressed={Number(duration) === seconds}
                className={Number(duration) === seconds ? "selected" : ""}
                onClick={() => editDuration(seconds)}
              >
                {seconds}s
              </button>
            ))}
          </div>
          <p id="timer-help" className="hint">
            Choose between 3 and 30 seconds.
          </p>
        </section>
        <section className="card names-card">
          <div className="section-heading">
            <UsersRound />
            <div>
              <h2>
                <label htmlFor="names">Names List</label>
              </h2>
              <p>Add names (one per line)</p>
            </div>
            <span className="badge">{names.length} names</span>
          </div>
          <textarea
            id="names"
            value={input}
            disabled={busy}
            onChange={(event) => editInput(event.target.value)}
            spellCheck="false"
            aria-describedby="names-help validation"
            placeholder={"Juan Dela Cruz\nMaria Santos"}
          />
          <div className="input-footer">
            <span id="names-help">Each name on a new line</span>
            <span>2–12 participants</span>
          </div>
        </section>
        <section className="card controls-card" aria-label="Game controls">
          <button
            className="primary start-button"
            disabled={busy || !!error}
            onClick={() => start(names, Number(duration))}
          >
            {busy ? (
              <Shuffle size={21} />
            ) : finished ? (
              <RotateCcw size={21} />
            ) : (
              <Play size={21} fill="currentColor" />
            )}
            {busy ? "Game in progress" : finished ? "Play Again" : "Start Game"}
          </button>
          <button
            className="secondary"
            disabled={busy || (!input && !finished)}
            onClick={() => (finished ? setShowReset(true) : editInput(""))}
          >
            {finished ? <RotateCcw size={19} /> : <Trash2 size={19} />}
            {finished ? "New Game" : "Clear Names"}
          </button>
          <p className="hint">One play. Everyone gets a position.</p>
        </section>
      </section>
      <p
        id="validation"
        className={`validation ${error ? "has-error" : ""}`}
        role="status"
      >
        {error || "All set! Start the game to reveal your group’s order."}
      </p>
      {soundUnavailable && (
        <p className="validation has-error" role="status">
          Sound unavailable. The game will continue without audio.
        </p>
      )}
      <section
        className="card game-area"
        aria-labelledby="game-title"
        aria-busy={busy}
      >
        <div className="section-heading">
          <span className="icon-tile">
            <Trophy />
          </span>
          <div>
            <h2 id="game-title">Game Area</h2>
            <p>Cups will shuffle and open to reveal everyone’s position.</p>
          </div>
          <span className="badge">
            <UsersRound size={16} /> {count} participants
          </span>
        </div>
        <div className="game-status" role="status" aria-live="polite">
          <span className={`status-dot ${busy ? "active" : ""}`} />
          {status}
          {phase === "shuffling" && (
            <span className="countdown">
              00:{String(game.remaining).padStart(2, "0")}
            </span>
          )}
          {phase === "revealing" && (
            <span className="countdown">
              {game.revealed} / {count}
            </span>
          )}
          {finished && <Check size={18} />}
        </div>
        <div className="cups-grid">
          {display.map((id) => (
            <Cup
              key={id}
              position={id + 1}
              name={game.order[id]}
              open={id < game.revealed}
              shuffling={phase === "shuffling"}
              stopping={phase === "stopping"}
            />
          ))}
        </div>
        {!display.length && (
          <div className="empty-state">
            <img src={closedCup} alt="" />
            <h3>Your cups are waiting</h3>
            <p>Add at least two names above to start the fun.</p>
          </div>
        )}
        <div className="steps">
          <div
            className={`step step-shuffle ${phase === "shuffling" ? "current" : ""}`}
          >
            <div className="step-heading">
              <span className="step-number">1</span>
              <div>
                <h3>Shuffling Cups</h3>
                <p>
                  {phase === "shuffling"
                    ? `${game.remaining} seconds remaining`
                    : "Mixing things up..."}
                </p>
              </div>
            </div>
            <div className="mini-cups shuffle-preview" aria-hidden="true">
              {[0, 1, 2].map((id) => (
                <img key={id} src={closedCup} alt="" />
              ))}
            </div>
            <ChevronRight className="step-arrow" />
          </div>
          <div
            className={`step step-stop ${phase === "stopping" ? "current" : ""}`}
          >
            <div className="step-heading">
              <span className="step-number">2</span>
              <div>
                <h3>Stopping</h3>
                <p>The cups settle into place.</p>
              </div>
            </div>
            <div className="mini-cups stop-preview" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((id) => (
                <img key={id} src={closedCup} alt="" />
              ))}
            </div>
            <ChevronRight className="step-arrow" />
          </div>
          <div
            className={`step step-reveal ${["revealing", "finished"].includes(phase) ? "current" : ""}`}
          >
            <div className="step-heading">
              <span className="step-number">3</span>
              <div>
                <h3>{finished ? "Everyone’s Revealed!" : "Opening Cups"}</h3>
                <p>Revealing every name, one by one.</p>
              </div>
            </div>
            <div className="reveal-preview">
              <img src={openCup} alt="" />
              <span className="reveal-label">
                {game.revealed
                  ? game.order[game.revealed - 1]
                  : "Who will be first?"}
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="card results" aria-labelledby="result-title">
        <div className="section-heading">
          <ListOrdered />
          <div>
            <h2 id="result-title">
              {finished ? "Final Order" : "Result Order"}
            </h2>
            <p>
              {finished
                ? "Your complete randomized order. Everyone appears exactly once."
                : "The complete order will appear here as the cups open."}
            </p>
          </div>
          {finished && (
            <span className="complete-badge">
              <Check size={14} /> Complete
            </span>
          )}
        </div>
        {count ? (
          <ol className="result-grid">
            {Array.from({ length: Math.min(count, 12) }, (_, i) => (
              <li key={i} className={i < game.revealed ? "revealed" : ""}>
                <span className="rank">{i + 1}</span>
                {i < game.revealed ? (
                  <Motion.strong
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {game.order[i]}
                  </Motion.strong>
                ) : (
                  <span className="result-placeholder">—</span>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-results">
            Add your participants to create an order.
          </p>
        )}
      </section>
      <footer>Leave it to chance. Let the cups decide.</footer>
      {showReset && (
        <ResetDialog onCancel={() => setShowReset(false)} onReset={resetAll} />
      )}
    </main>
  );
}

export default App;
