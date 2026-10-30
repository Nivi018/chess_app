import { useMemo, useState, type CSSProperties, type FormEvent } from 'react'
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
} from '../../../domain/lesson'
import { knightLesson } from '../../../content/knight-lesson'

export type Feedback = {
  tone: 'neutral' | 'success' | 'try-again'
  message: string
}

export type StorageState = 'ready' | 'saved' | 'unavailable'

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

export function useKnightLesson() {
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

  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {
      b1: { boxShadow: 'inset 0 0 0 3px rgba(20, 123, 114, .74)' },
    }

    if (selectedSquare) {
      styles[selectedSquare] = { boxShadow: 'inset 0 0 0 4px #f5ce42' }
    }

    if (routeVisible) {
      styles.c3 = { boxShadow: 'inset 0 0 0 4px #f5ce42' }
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

  function replayLesson() {
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
    lightSquareStyle: { backgroundColor: '#eef3ee', color: '#4f6661' },
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

  return {
    boardOptions,
    feedback,
    handleKeyboardSubmit,
    handleKeyboardDestinationChange: setKeyboardDestination,
    hintVisible,
    keyboardDestination,
    lesson: knightLesson,
    progress,
    replaying,
    replayLesson,
    routeVisible,
    setHintVisible,
    storageState,
  }
}
