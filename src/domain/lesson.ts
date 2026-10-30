import { Chess, type Square } from 'chess.js'

export const LESSON_PROGRESS_KEY = 'chess-academy:knight-first-move:v1'
export const LESSON_ID = 'knight-first-move'
export const LESSON_START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export type MoveOutcome = 'correct' | 'other-legal' | 'illegal' | 'wrong-piece'

export type LessonProgress = {
  lessonId: typeof LESSON_ID
  attempts: number
  completed: boolean
  completedAt: string | null
}

export function createInitialProgress(): LessonProgress {
  return {
    lessonId: LESSON_ID,
    attempts: 0,
    completed: false,
    completedAt: null,
  }
}

export function classifyKnightMove(from: string, to: string): MoveOutcome {
  if (from !== 'b1') return 'wrong-piece'

  const game = new Chess(LESSON_START_FEN)
  try {
    game.move({ from: from as Square, to: to as Square })
  } catch {
    return 'illegal'
  }

  return to === 'c3' ? 'correct' : 'other-legal'
}

export function recordAttempt(
  progress: LessonProgress,
  outcome: MoveOutcome,
  completedAt = new Date().toISOString(),
): LessonProgress {
  const isFirstCompletion = !progress.completed && outcome === 'correct'

  return {
    ...progress,
    attempts: progress.attempts + 1,
    completed: progress.completed || outcome === 'correct',
    completedAt: isFirstCompletion ? completedAt : progress.completedAt,
  }
}

export function loadProgress(storage: Pick<Storage, 'getItem'>): LessonProgress {
  try {
    const stored = storage.getItem(LESSON_PROGRESS_KEY)
    if (!stored) return createInitialProgress()

    const value: unknown = JSON.parse(stored)
    if (!isLessonProgress(value)) return createInitialProgress()
    return value
  } catch {
    return createInitialProgress()
  }
}

export function saveProgress(
  progress: LessonProgress,
  storage: Pick<Storage, 'setItem'>,
): boolean {
  try {
    storage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

function isLessonProgress(value: unknown): value is LessonProgress {
  if (typeof value !== 'object' || value === null) return false

  const progress = value as Partial<LessonProgress>
  return (
    progress.lessonId === LESSON_ID &&
    Number.isInteger(progress.attempts) &&
    (progress.attempts ?? -1) >= 0 &&
    typeof progress.completed === 'boolean' &&
    (typeof progress.completedAt === 'string' || progress.completedAt === null)
  )
}
