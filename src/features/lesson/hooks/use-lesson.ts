import { useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { Chess } from 'chess.js'
import {
  classifyLessonMove,
  createInitialProgress,
  LESSON_PROGRESS_KEY,
  loadProgress,
  recordAttempt,
  recordHint,
  saveProgress,
  type LessonProgress,
  type MoveOutcome,
} from '../../../domain/lesson'
import type { LessonDefinition } from '../../../content/lessons'

export type Feedback = {
  tone: 'neutral' | 'success' | 'try-again'
  message: string
}

export type StorageState = 'ready' | 'saved' | 'unavailable'

const initialFeedback: Feedback = {
  tone: 'neutral',
  message: 'Selecciona la pieza indicada y prueba el movimiento. También puedes elegir un destino con el teclado.',
}

function readBrowserProgress(lessonId: string): LessonProgress {
  try {
    return loadProgress(window.localStorage, lessonId)
  } catch {
    return createInitialProgress(lessonId)
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

function feedbackFor(lesson: LessonDefinition, outcome: MoveOutcome): Feedback {
  switch (outcome) {
    case 'correct':
      return { tone: 'success', message: lesson.feedback.correct }
    case 'other-legal':
      return { tone: 'try-again', message: lesson.feedback.otherLegal }
    case 'wrong-piece':
      return { tone: 'try-again', message: lesson.feedback.wrongPiece }
    case 'illegal':
      return { tone: 'try-again', message: lesson.feedback.illegal }
  }
}

export function useLesson(lesson: LessonDefinition, onProgressChange: (progress: LessonProgress) => void) {
  const [progress, setProgress] = useState(() => readBrowserProgress(lesson.id))
  const [storageState, setStorageState] = useState<StorageState>(() =>
    browserStorageAvailable() ? (progress.attempts > 0 || progress.hintsUsed ? 'saved' : 'ready') : 'unavailable',
  )
  const [position, setPosition] = useState(() => {
    const game = new Chess(lesson.startFen)
    if (progress.completed) {
      game.move({ from: lesson.targetFrom, to: lesson.targetTo })
    }
    return game.fen()
  })
  const [feedback, setFeedback] = useState<Feedback>(() =>
    progress.completed ? feedbackFor(lesson, 'correct') : initialFeedback,
  )
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [replaying, setReplaying] = useState(false)
  const [keyboardDestination, setKeyboardDestination] = useState('')
  const [hintVisible, setHintVisible] = useState(false)
  const [routeVisible, setRouteVisible] = useState(progress.completed)

  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {
      [lesson.targetFrom]: { boxShadow: 'inset 0 0 0 3px rgba(20, 123, 114, .74)' },
    }

    if (selectedSquare) {
      styles[selectedSquare] = { boxShadow: 'inset 0 0 0 4px #f5ce42' }
    }

    if (routeVisible) {
      styles[lesson.targetTo] = { boxShadow: 'inset 0 0 0 4px #f5ce42' }
    }

    return styles
  }, [lesson, routeVisible, selectedSquare])

  function persistProgress(updatedProgress: LessonProgress) {
    setProgress(updatedProgress)
    onProgressChange(updatedProgress)
    try {
      setStorageState(saveProgress(updatedProgress, window.localStorage) ? 'saved' : 'unavailable')
    } catch {
      setStorageState('unavailable')
    }
  }

  function toggleHint() {
    if (!hintVisible && (!progress.completed || replaying)) persistProgress(recordHint(progress))
    setHintVisible((visible) => !visible)
  }

  function submitMove(from: string, to: string): boolean {
    if (progress.completed && !replaying) return false
    const outcome = classifyLessonMove(lesson, from, to)
    persistProgress(recordAttempt(progress, outcome))

    setFeedback(feedbackFor(lesson, outcome))
    setSelectedSquare(null)
    setKeyboardDestination('')

    if (outcome !== 'correct') return false

    const game = new Chess(lesson.startFen)
    game.move({ from: lesson.targetFrom, to: lesson.targetTo })
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

    if (square === lesson.targetFrom) {
      setSelectedSquare(square)
      setFeedback({ tone: 'neutral', message: 'Pieza seleccionada. Ahora elige su casilla de destino.' })
      return
    }

    if (square !== lesson.targetFrom) {
      setFeedback({ tone: 'try-again', message: lesson.feedback.wrongPiece })
    }
  }

  function handleKeyboardSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!keyboardDestination) {
      setFeedback({ tone: 'try-again', message: 'Elige una casilla de destino antes de comprobar la jugada.' })
      return
    }
    submitMove(lesson.targetFrom, keyboardDestination)
  }

  function replayLesson() {
    setPosition(lesson.startFen)
    setSelectedSquare(null)
    setKeyboardDestination('')
    setHintVisible(false)
    setRouteVisible(false)
    setFeedback(initialFeedback)
    setReplaying(true)
  }

  const boardOptions = {
    id: lesson.id,
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
    canDragPiece: ({ square }: { square: string | null }) =>
      (!progress.completed || replaying) && square === lesson.targetFrom,
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
    progress,
    replaying,
    replayLesson,
    routeVisible,
    toggleHint,
    storageState,
  }
}
