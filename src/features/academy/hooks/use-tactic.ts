import { useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { Chess, type Square } from 'chess.js'
import type { TacticDefinition } from '../../../content/tactics'
import { classifyTacticMove, replayTactic } from '../../../domain/tactics'
import { createInitialProgress, recordAttempt, recordHint, saveProgress, type LessonProgress, type MoveOutcome } from '../../../domain/lesson'
import type { StorageState } from '../../lesson/hooks/use-lesson'

export type TacticFeedback = { tone: 'neutral' | 'success' | 'try-again'; message: string }

const initialFeedback: TacticFeedback = { tone: 'neutral', message: 'Busca la jugada que resuelve el reto. Puedes usar el tablero o el selector de jugadas.' }

function messageFor(tactic: TacticDefinition, outcome: MoveOutcome): string {
  if (outcome === 'wrong-piece') return 'Esa no es la pieza que continúa la combinación. Prueba otra jugada.'
  if (outcome === 'other-legal') return 'Esa jugada es legal, pero no continúa la combinación de este ejercicio.'
  if (outcome === 'illegal') return 'Esa jugada no es legal en esta posición. Elige una casilla legal.'
  return tactic.explanation
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
  const [feedback, setFeedback] = useState<TacticFeedback>(solved ? { tone: 'success', message: tactic.explanation } : initialFeedback)
  const [routeVisible, setRouteVisible] = useState(solved)
  const [replaying, setReplaying] = useState(replay)
  const expected = tactic.steps[stepIndex]
  const game = useMemo(() => new Chess(position), [position])
  const legalMoves = useMemo(() => game.moves({ verbose: true }), [game])
  const moveOptions = useMemo(() => legalMoves.map((move) => ({
    label: `${move.to} — ${pieceName(move.piece)} desde ${move.from}${move.san.includes('+') ? ' (jaque)' : ''}`,
    value: `${move.from}:${move.to}`,
  })), [legalMoves])
  const squareStyles = useMemo(() => selectedSquare ? {
    [selectedSquare]: { boxShadow: 'inset 0 0 0 4px #f5ce42' } satisfies CSSProperties,
  } : {}, [selectedSquare])

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
      setFeedback({ tone: 'try-again', message: messageFor(tactic, outcome) })
      return false
    }

    const nextGame = new Chess(position)
    const learnerMove = nextGame.move({ from, to })
    const nextSan = [...lineSan, learnerMove.san]
    let nextIndex = stepIndex + 1
    const preparedReply = tactic.steps[nextIndex]
    let response = ''
    if (preparedReply?.actor === 'prepared-reply') {
      const reply = nextGame.move({ from: preparedReply.from, to: preparedReply.to })
      nextSan.push(reply.san)
      response = `Respuesta rival preparada: ${reply.san}. `
      nextIndex += 1
    }

    setPosition(nextGame.fen())
    setLineSan(nextSan)
    setStepIndex(nextIndex)

    if (nextIndex >= tactic.steps.length) {
      const updated = recordAttempt(currentProgress, 'correct')
      persist(updated)
      setRouteVisible(true)
      setReplaying(false)
      setHintVisible(false)
      setFeedback({ tone: 'success', message: tactic.explanation })
      return true
    }

    setFeedback({ tone: 'neutral', message: `${response}Ahora encuentra la siguiente jugada de la combinación.` })
    return true
  }

  function handleSquareClick(square: string) {
    if (!expected || (currentProgress.completed && !replaying)) return
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
    const [from, to] = keyboardMove.split(':')
    if (!from || !to) {
      setFeedback({ tone: 'try-again', message: 'Elige una jugada antes de comprobarla.' })
      return
    }
    submitMove(from, to)
  }

  function toggleHint() {
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
  }

  return {
    position,
    lineSan,
    expected,
    stepIndex,
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
