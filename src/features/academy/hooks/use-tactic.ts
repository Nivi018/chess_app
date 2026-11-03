import { useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { Chess, type Square } from 'chess.js'
import type { TacticDefinition } from '../../../content/tactics'
import { classifyTacticMove, replayTactic } from '../../../domain/tactics'
import { createInitialProgress, recordAttempt, recordHint, saveProgress, type LessonProgress, type MoveOutcome } from '../../../domain/lesson'
import type { StorageState } from '../../lesson/hooks/use-lesson'

export type TacticFeedback = { tone: 'neutral' | 'success' | 'try-again'; message: string }

const initialFeedback: TacticFeedback = { tone: 'neutral', message: 'Busca la jugada que resuelve el reto. Puedes usar el tablero o el selector de jugadas.' }
const solvedFeedback: TacticFeedback = { tone: 'success', message: '¡Combinación resuelta! Revisa la explicación y las jugadas realizadas.' }

function messageFor(outcome: Exclude<MoveOutcome, 'correct'>): string {
  if (outcome === 'wrong-piece') return 'Esa no es la pieza que continúa la combinación. Prueba otra jugada.'
  if (outcome === 'other-legal') return 'Esa jugada es legal, pero este ejercicio sigue una variante concreta. Prueba otra o consulta la pista; no significa que sea una mala jugada en una partida.'
  return 'Esa jugada no es legal en esta posición. Elige una casilla legal.'
}

export function useTactic(
  tactic: TacticDefinition,
  progress: LessonProgress = createInitialProgress(tactic.id),
  onProgressChange: (progress: LessonProgress, state: StorageState) => void = () => {},
  replay = false,
) {
  const [currentProgress, setCurrentProgress] = useState(progress)
  const solved = currentProgress.completed && !replay
  const initialLine = solved ? replayTactic(tactic) : { position: tactic.startFen, moves: [] as string[] }
  const [position, setPosition] = useState(initialLine.position)
  const [lineSan, setLineSan] = useState(initialLine.moves)
  const [stepIndex, setStepIndex] = useState(solved ? tactic.steps.length : 0)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [keyboardMove, setKeyboardMove] = useState('')
  const [hintVisible, setHintVisible] = useState(false)
  const [feedback, setFeedback] = useState<TacticFeedback>(solved ? solvedFeedback : initialFeedback)
  const [routeVisible, setRouteVisible] = useState(solved)
  const [replaying, setReplaying] = useState(replay)
  const [lastReply, setLastReply] = useState<{ from: Square; to: Square; san: string; explanation: string } | null>(null)
  const expected = tactic.steps[stepIndex]
  const canPlay = expected?.actor === 'learner' && (!currentProgress.completed || replaying)
  const game = useMemo(() => new Chess(position), [position])
  const legalMoves = useMemo(() => canPlay ? game.moves({ verbose: true }) : [], [game, canPlay])
  const moveOptions = useMemo(() => legalMoves.map((move) => ({
    label: `${move.to} — ${pieceName(move.piece)} desde ${move.from}${move.san.includes('+') ? ' (jaque)' : ''}`,
    value: `${move.from}:${move.to}`,
  })), [legalMoves])
  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {}
    if (lastReply && !selectedSquare) {
      styles[lastReply.from] = { boxShadow: 'inset 0 0 0 2px #147b72' }
      styles[lastReply.to] = { boxShadow: 'inset 0 0 0 3px #147b72' }
    }
    if (selectedSquare) styles[selectedSquare] = { boxShadow: 'inset 0 0 0 4px #f5ce42' }
    return styles
  }, [selectedSquare, lastReply])

  function persist(updated: LessonProgress) {
    setCurrentProgress(updated)
    let state: StorageState = 'unavailable'
    try { state = saveProgress(updated, window.localStorage) ? 'saved' : 'unavailable' } catch { /* Keep this session usable. */ }
    onProgressChange(updated, state)
  }

  function submitMove(from: string, to: string): boolean {
    if (!expected || expected.actor !== 'learner' || (currentProgress.completed && !replaying)) return false
    const outcome = classifyTacticMove(position, expected, from, to)
    setSelectedSquare(null)
    setKeyboardMove('')
    if (outcome !== 'correct') {
      const updated = recordAttempt(currentProgress, outcome)
      persist(updated)
      setFeedback({ tone: 'try-again', message: messageFor(outcome) })
      return false
    }

    const nextGame = new Chess(position)
    const learnerMove = nextGame.move({ from, to })
    const nextSan = [...lineSan, learnerMove.san]
    const nextIndex = stepIndex + 1

    setPosition(nextGame.fen())
    setLineSan(nextSan)
    setStepIndex(nextIndex)
    setHintVisible(false)
    setLastReply(null)

    if (nextIndex >= tactic.steps.length) {
      const updated = recordAttempt(currentProgress, 'correct')
      persist(updated)
      setRouteVisible(true)
      setReplaying(false)
      setHintVisible(false)
      setFeedback(solvedFeedback)
      return true
    }

    setFeedback({ tone: 'neutral', message: 'Tu jugada es correcta. Observa la posición y pulsa «Ver respuesta rival» cuando quieras continuar.' })
    return true
  }

  function showPreparedReply() {
    if (expected?.actor !== 'prepared-reply' || (currentProgress.completed && !replaying)) return
    const nextGame = new Chess(position)
    const reply = nextGame.move({ from: expected.from, to: expected.to })
    setPosition(nextGame.fen())
    setLineSan([...lineSan, reply.san])
    setStepIndex(stepIndex + 1)
    setLastReply({ from: expected.from, to: expected.to, san: reply.san, explanation: expected.explanation })
    setHintVisible(false)
    setSelectedSquare(null)
    setKeyboardMove('')
    setFeedback({ tone: 'neutral', message: `Respuesta rival preparada: ${reply.san}. Ahora encuentra la siguiente jugada de la combinación.` })
  }

  function handleSquareClick(square: string) {
    if (!canPlay) return
    if (selectedSquare) {
      if (square === selectedSquare) { setSelectedSquare(null); return }
      submitMove(selectedSquare, square)
      return
    }
    if (game.get(square as Square)?.color === game.turn()) {
      setSelectedSquare(square)
      return
    }
    setFeedback({ tone: 'try-again', message: 'Selecciona una pieza de tu color para probar una jugada.' })
  }

  function handleKeyboardSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canPlay) return
    const [from, to] = keyboardMove.split(':')
    if (!from || !to) {
      setFeedback({ tone: 'try-again', message: 'Elige una jugada antes de comprobarla.' })
      return
    }
    submitMove(from, to)
  }

  function toggleHint() {
    if (!canPlay) return
    if (!hintVisible && (!currentProgress.completed || replaying)) persist(recordHint(currentProgress))
    setHintVisible((visible) => !visible)
  }

  function replayTacticNow() {
    setPosition(tactic.startFen)
    setLineSan([])
    setStepIndex(0)
    setSelectedSquare(null)
    setKeyboardMove('')
    setHintVisible(false)
    setRouteVisible(false)
    setFeedback(initialFeedback)
    setReplaying(true)
    setLastReply(null)
  }

  return {
    position,
    lineSan,
    expected,
    stepIndex,
    canPlay,
    waitingForReply: expected?.actor === 'prepared-reply',
    currentInstruction: expected?.actor === 'learner' ? expected.instruction : 'Tu jugada está hecha. Observa el tablero antes de ver la respuesta rival preparada.',
    currentHint: expected?.actor === 'learner' ? expected.hint : '',
    lastReply,
    showPreparedReply,
    moveOptions,
    selectedSquare,
    squareStyles,
    hintVisible,
    feedback,
    routeVisible,
    replaying,
    keyboardMove,
    completed: currentProgress.completed && !replaying,
    onSquareClick: handleSquareClick,
    onPieceDrop: ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
      if (!targetSquare) return false
      return submitMove(sourceSquare, targetSquare)
    },
    onKeyboardMoveChange: setKeyboardMove,
    onKeyboardSubmit: handleKeyboardSubmit,
    toggleHint,
    replayTactic: replayTacticNow,
  }
}

function pieceName(piece: string) {
  return ({ p: 'Peón', n: 'Caballo', b: 'Alfil', r: 'Torre', q: 'Dama', k: 'Rey' } as Record<string, string>)[piece] ?? 'Pieza'
}
