import { Chess, type Square } from 'chess.js'

export const LESSON_PROGRESS_KEY = 'chess-academy:knight-first-move:v1'
export const LESSON_ID = 'knight-first-move'
export const LESSON_START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export type MoveOutcome = 'correct' | 'other-legal' | 'illegal' | 'wrong-piece'

export type MoveExercise = {
  startFen: string
  targetFrom: Square
  targetTo: Square
}

export type LessonProgress = {
  lessonId: string
  attempts: number
  completed: boolean
  completedAt: string | null
}

export function createInitialProgress(lessonId: string = LESSON_ID): LessonProgress {
  return {
    lessonId,
    attempts: 0,
    completed: false,
    completedAt: null,
  }
}

export function classifyKnightMove(from: string, to: string): MoveOutcome {
  return classifyLessonMove({ startFen: LESSON_START_FEN, targetFrom: 'b1', targetTo: 'c3' }, from, to)
}

export function classifyLessonMove(lesson: MoveExercise, from: string, to: string): MoveOutcome {
  if (from !== lesson.targetFrom) return 'wrong-piece'
  try {
    new Chess(lesson.startFen).move({ from, to })
    return to === lesson.targetTo ? 'correct' : 'other-legal'
  } catch {
    return 'illegal'
  }
}

export function progressKey(lessonId: string): string {
  return `chess-academy:${lessonId}:v1`
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

export function loadProgress(storage: Pick<Storage, 'getItem'>, lessonId: string = LESSON_ID): LessonProgress {
  try {
    const stored = storage.getItem(progressKey(lessonId))
    if (!stored) return createInitialProgress(lessonId)

    const value: unknown = JSON.parse(stored)
    if (!isLessonProgress(value, lessonId)) return createInitialProgress(lessonId)
    return value
  } catch {
    return createInitialProgress(lessonId)
  }
}

export function saveProgress(
  progress: LessonProgress,
  storage: Pick<Storage, 'setItem'>,
): boolean {
  try {
    storage.setItem(progressKey(progress.lessonId), JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

function isLessonProgress(value: unknown, lessonId: string): value is LessonProgress {
  if (typeof value !== 'object' || value === null) return false

  const progress = value as Partial<LessonProgress>
  return (
    progress.lessonId === lessonId &&
    Number.isInteger(progress.attempts) &&
    (progress.attempts ?? -1) >= 0 &&
    typeof progress.completed === 'boolean' &&
    (typeof progress.completedAt === 'string' || progress.completedAt === null)
  )
}
