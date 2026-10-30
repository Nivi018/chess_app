import type { MoveExercise } from '../domain/lesson'

export type LessonDefinition = MoveExercise & {
  id: string
  title: string
  summary: string
  coachTitle: string
  explanation: string
  instruction: string
  hint: string
  pieceName: string
  feedback: { correct: string; otherLegal: string; illegal: string; wrongPiece: string }
}
