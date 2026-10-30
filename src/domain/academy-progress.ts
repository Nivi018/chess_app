import type { LessonDefinition } from '../content/lesson-definition'
import type { LessonProgress } from './lesson'

export type AcademyProgress = Record<string, LessonProgress>
export type ActivityTarget = { mode: 'lessons' | 'review'; activityId: string; replay?: boolean }
type Activity = Pick<LessonDefinition, 'id' | 'title'>

export function summarizeProgress(catalog: Activity[], progress: AcademyProgress) {
  const records = catalog.flatMap((activity) => progress[activity.id] ? [progress[activity.id]] : [])
  return {
    total: catalog.length,
    completed: records.filter((record) => record.completed).length,
    attempts: records.reduce((total, record) => total + record.attempts, 0),
    hints: records.reduce((total, record) => total + (record.hintsUsed ?? 0), 0),
    firstTry: records.filter((record) => record.firstAttemptCorrect === true).length,
    unknownFirstResult: records.filter((record) => record.completed && record.firstAttemptCorrect === undefined).length,
  }
}

export function recommendActivity(lessons: Activity[], reviews: Activity[], progress: AcademyProgress): {
  target: ActivityTarget
  title: string
  reason: string
} | null {
  const lesson = lessons.find((activity) => !progress[activity.id]?.completed)
  if (lesson) return {
    target: { mode: 'lessons', activityId: lesson.id }, title: lesson.title,
    reason: 'Continúa con la primera lección pendiente del curso.',
  }
  const review = reviews.find((activity) => !progress[activity.id]?.completed)
  if (review) return {
    target: { mode: 'review', activityId: review.id }, title: review.title,
    reason: 'Ya completaste las lecciones. Practica ahora el primer repaso pendiente.',
  }
  const reinforce = reviews.find((activity) => progress[activity.id]?.firstAttemptCorrect === false)
  if (reinforce) return {
    target: { mode: 'review', activityId: reinforce.id, replay: true }, title: reinforce.title,
    reason: 'En tu primer resultado necesitaste una pista o más de un intento. Puedes volver a practicarlo; repetir no cambia ese primer resultado.',
  }
  const activity = reviews[0] ?? lessons[0]
  return activity ? {
    target: { mode: reviews.length ? 'review' : 'lessons', activityId: activity.id, replay: true }, title: activity.title,
    reason: 'Completaste todas las actividades disponibles. Puedes repetir una para seguir practicando.',
  } : null
}
