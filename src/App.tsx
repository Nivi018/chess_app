import { useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { Chessboard } from 'react-chessboard'
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpenText,
  Check,
  ChevronDown,
  CircleHelp,
  RotateCcw,
  Route,
  X,
} from 'lucide-react'
import { Chess, type Square } from 'chess.js'
import {
  classifyKnightMove,
  createInitialProgress,
  LESSON_PROGRESS_KEY,
  LESSON_START_FEN,
  loadProgress,
  recordAttempt,
  saveProgress,
  type LessonProgress,
  type MoveOutcome,
} from './domain/lesson'
import { knightLesson } from './content/knight-lesson'

type Feedback = {
  tone: 'neutral' | 'success' | 'try-again'
  message: string
}

type StorageState = 'ready' | 'saved' | 'unavailable'

const initialFeedback: Feedback = {
  tone: 'neutral',
  message: 'Selecciona el caballo y prueba el movimiento. También puedes elegir un destino con el teclado.',
}

function readBrowserProgress(): LessonProgress {
  try {
    return loadProgress(window.localStorage)
  } catch {
    return createInitialProgress()
  }
}

function browserStorageAvailable(): boolean {
  try {
    window.localStorage.getItem(LESSON_PROGRESS_KEY)
    return true
  } catch {
    return false
  }
}

function feedbackFor(outcome: MoveOutcome): Feedback {
  switch (outcome) {
    case 'correct':
      return { tone: 'success', message: knightLesson.feedback.correct }
    case 'other-legal':
      return { tone: 'try-again', message: knightLesson.feedback.otherLegal }
    case 'wrong-piece':
      return { tone: 'try-again', message: knightLesson.feedback.wrongPiece }
    case 'illegal':
      return { tone: 'try-again', message: knightLesson.feedback.illegal }
  }
}

export default function App() {
  const [progress, setProgress] = useState(readBrowserProgress)
  const [storageState, setStorageState] = useState<StorageState>(() =>
    browserStorageAvailable() ? (progress.attempts > 0 ? 'saved' : 'ready') : 'unavailable',
  )
  const [position, setPosition] = useState(() => {
    const game = new Chess(LESSON_START_FEN)
    if (progress.completed) {
      game.move({ from: knightLesson.targetFrom as Square, to: knightLesson.targetTo as Square })
    }
    return game.fen()
  })
  const [feedback, setFeedback] = useState<Feedback>(() =>
    progress.completed ? feedbackFor('correct') : initialFeedback,
  )
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [replaying, setReplaying] = useState(false)
  const [keyboardDestination, setKeyboardDestination] = useState('')
  const [hintVisible, setHintVisible] = useState(false)
  const [routeVisible, setRouteVisible] = useState(progress.completed)
  const lessonRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {
      b1: {
        boxShadow: 'inset 0 0 0 3px rgba(20, 123, 114, .74)',
      },
    }

    if (selectedSquare) {
      styles[selectedSquare] = {
        boxShadow: 'inset 0 0 0 4px #f5ce42',
      }
    }

    if (routeVisible) {
      styles.c3 = {
        boxShadow: 'inset 0 0 0 4px #f5ce42',
      }
    }

    return styles
  }, [routeVisible, selectedSquare])

  function submitMove(from: string, to: string): boolean {
    const outcome = classifyKnightMove(from, to)
    const updatedProgress = recordAttempt(progress, outcome)
    setProgress(updatedProgress)

    try {
      setStorageState(saveProgress(updatedProgress, window.localStorage) ? 'saved' : 'unavailable')
    } catch {
      setStorageState('unavailable')
    }

    setFeedback(feedbackFor(outcome))
    setSelectedSquare(null)
    setKeyboardDestination('')

    if (outcome !== 'correct') return false

    const game = new Chess(LESSON_START_FEN)
    game.move({ from: knightLesson.targetFrom as Square, to: knightLesson.targetTo as Square })
    setPosition(game.fen())
    setRouteVisible(true)
    setHintVisible(false)
    setReplaying(false)
    return true
  }

  function handleBoardSquareClick(square: string) {
    if (progress.completed && !replaying) return

    if (selectedSquare) {
      if (square === selectedSquare) {
        setSelectedSquare(null)
        return
      }
      submitMove(selectedSquare, square)
      return
    }

    if (square === knightLesson.targetFrom) {
      setSelectedSquare(square)
      setFeedback({ tone: 'neutral', message: 'Caballo seleccionado. Ahora elige su casilla de destino.' })
      return
    }

    if (squareStyles[square] === undefined && square !== 'b1') {
      setFeedback({ tone: 'try-again', message: knightLesson.feedback.wrongPiece })
    }
  }

  function handleKeyboardSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!keyboardDestination) {
      setFeedback({ tone: 'try-again', message: 'Elige una casilla de destino antes de comprobar la jugada.' })
      return
    }
    submitMove(knightLesson.targetFrom, keyboardDestination)
  }

  function handleReset() {
    setPosition(LESSON_START_FEN)
    setSelectedSquare(null)
    setKeyboardDestination('')
    setHintVisible(false)
    setRouteVisible(false)
    setFeedback(initialFeedback)
    setReplaying(true)
  }

  const boardOptions = {
    id: 'first-knight-lesson',
    position,
    boardOrientation: 'white' as const,
    showNotation: true,
    allowDrawingArrows: false,
    allowDragOffBoard: false,
    animationDurationInMs: 220,
    boardStyle: { width: '100%', borderRadius: '4px', overflow: 'hidden' as const },
    lightSquareStyle: { backgroundColor: '#eef3ee', color: '#48615c' },
    darkSquareStyle: { backgroundColor: '#b9cdc2', color: '#173238' },
    lightSquareNotationStyle: { color: '#526c65', fontWeight: 700 },
    darkSquareNotationStyle: { color: '#284d45', fontWeight: 700 },
    alphaNotationStyle: { fontSize: '12px', fontWeight: 700, bottom: 3, right: 5 },
    numericNotationStyle: { fontSize: '12px', fontWeight: 700, top: 3, left: 5 },
    squareStyles,
    canDragPiece: ({ piece, square }: { piece: { pieceType: string }; square: string | null }) =>
      (!progress.completed || replaying) && piece.pieceType === 'wN' && square === knightLesson.targetFrom,
    onPieceDrop: ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
      if (!targetSquare) return false
      return submitMove(sourceSquare, targetSquare)
    },
    onSquareClick: ({ square }: { square: string }) => handleBoardSquareClick(square),
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#lesson" aria-label="Ajedrez desde cero, ir a la lección">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M5 24h8V8M13 24h6V14h8" />
                <circle cx="5" cy="24" r="2.5" />
                <circle cx="27" cy="14" r="2.5" />
              </svg>
            </span>
            <span>Ajedrez desde cero</span>
          </a>
          <div className={`save-status save-status--${storageState}`} aria-live="polite">
            {storageState === 'unavailable' ? <X size={16} aria-hidden="true" /> : <ArrowDownToLine size={16} aria-hidden="true" />}
            <span>
              {storageState === 'saved'
                ? 'Progreso guardado aquí'
                : storageState === 'unavailable'
                  ? 'No se pudo guardar en este navegador'
                  : 'El progreso se guarda en este dispositivo'}
            </span>
          </div>
        </div>
      </header>

      <div className="page-layout">
        <aside className="side-rail" aria-label="Navegación de la academia">
          <div className="rail-caption">TU ESPACIO</div>
          <button className="rail-link rail-link--active" onClick={() => lessonRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            <BookOpenText size={18} aria-hidden="true" />
            <span>Mi primera lección</span>
          </button>
          <button className="rail-link" onClick={() => progressRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            <Route size={18} aria-hidden="true" />
            <span>Mi avance</span>
            {progress.completed && <Check className="rail-check" size={16} aria-label="Lección completada" />}
          </button>
          <div className="rail-progress" ref={progressRef}>
            <div className="rail-progress-heading">Tu recorrido</div>
            <div className="rail-progress-label"><span>Primera lección</span><span>{progress.completed ? '1 / 1' : '0 / 1'}</span></div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Progreso de la lección"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress.completed ? 100 : 0}
            >
              <span className={progress.completed ? 'is-complete' : ''} />
            </div>
            <p>{progress.completed ? 'Ya diste tu primer paso.' : 'Una jugada a la vez.'}</p>
          </div>
          <div className="rail-note">
            <CircleHelp size={17} aria-hidden="true" />
            <span>No necesitas saber nada de ajedrez para empezar.</span>
          </div>
        </aside>

        <main className="lesson-main" id="lesson" ref={lessonRef}>
          <div className="lesson-heading">
            <div>
              <h1>{knightLesson.title}</h1>
              <p>{knightLesson.summary}</p>
            </div>
            <span className="lesson-count">Lección 1 <span>de 1</span></span>
          </div>

          <div className="lesson-grid">
            <section className="board-panel" aria-labelledby="board-heading">
              <div className="panel-heading">
                <div>
                  <h2 id="board-heading">Mira el tablero</h2>
                  <p>Las letras y los números te ayudan a encontrar cada casilla.</p>
                </div>
                <span className="turn-label"><span className="turn-dot" /> Juegan blancas</span>
              </div>

              <div className={`board-frame${routeVisible ? ' board-frame--route-visible' : ''}`}>
                <div className="board-canvas" role="group" aria-label="Tablero de ajedrez. El caballo blanco empieza en b1.">
                  <Chessboard options={boardOptions} />
                  {routeVisible && (
                    <div className="route-overlay" aria-hidden="true">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M18.75 93.75 C20 81 27 73 31.25 68.75" />
                        <circle cx="18.75" cy="93.75" r="2.1" />
                        <circle cx="31.25" cy="68.75" r="2.1" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="board-instructions">
                <div className="instruction-mark" aria-hidden="true"><ArrowRight size={17} /></div>
                <p>Arrastra el caballo desde <strong>b1</strong>, o tócalo y luego elige su destino.</p>
                <button className="hint-button" onClick={() => setHintVisible((visible) => !visible)} aria-expanded={hintVisible}>
                  {hintVisible ? 'Ocultar pista' : 'Necesito una pista'}
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
              </div>

              {hintVisible && (
                <p className="hint-copy" role="note"><CircleHelp size={16} aria-hidden="true" />{knightLesson.hint}</p>
              )}

              <form className="keyboard-move" onSubmit={handleKeyboardSubmit}>
                <label htmlFor="knight-destination">¿Prefieres elegir la casilla?</label>
                <div className="keyboard-controls">
                  <select
                    id="knight-destination"
                    value={keyboardDestination}
                    onChange={(event) => setKeyboardDestination(event.target.value)}
                    disabled={progress.completed && !replaying}
                  >
                    <option value="">Elige un destino</option>
                    <option value="a3">a3</option>
                    <option value="c3">c3</option>
                  </select>
                  <button type="submit" disabled={progress.completed && !replaying}>Comprobar</button>
                </div>
              </form>
            </section>

            <aside className="lesson-panel" aria-label="Instrucciones de la lección">
              <h2>Recuerda la forma de L</h2>
              <p className="lesson-explanation">{knightLesson.explanation}</p>

              <div className="challenge-block">
                <div className="challenge-heading">
                  {progress.completed ? <Check size={17} aria-hidden="true" /> : <span className="challenge-index">TU TURNO</span>}
                  {progress.completed && <span className="challenge-index">¡LO LOGRASTE!</span>}
                </div>
                <p>{progress.completed ? 'Fíjate en el recorrido: dos casillas y una más hacia un lado.' : knightLesson.instruction}</p>
                {progress.completed && (
                  <div className="completed-route"><span>b1</span><ArrowRight size={16} aria-hidden="true" /><span>c3</span><small>Tu primer salto</small></div>
                )}
              </div>

              <div className={`feedback feedback--${feedback.tone}`} role="status" aria-live="polite" aria-atomic="true">
                {feedback.tone === 'success' ? <Check size={17} aria-hidden="true" /> : feedback.tone === 'try-again' ? <RotateCcw size={16} aria-hidden="true" /> : <CircleHelp size={17} aria-hidden="true" />}
                <p>{feedback.message}</p>
              </div>

              {progress.completed ? (
                <button className="primary-button replay-button" onClick={handleReset}>
                  <RotateCcw size={16} aria-hidden="true" /> Repetir el ejercicio
                </button>
              ) : (
                <p className="try-prompt">Haz tu jugada en el tablero. Si no estás seguro, puedes pedir una pista.</p>
              )}

              <div className="attempt-count">
                <span>Intentos</span>
                <strong>{progress.attempts}</strong>
              </div>
            </aside>
          </div>

          <footer className="lesson-footer">
            <span>Reglas verificadas para que puedas aprender con confianza.</span>
            <span>Tu avance se queda en este dispositivo.</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
