import { describe, expect, it } from 'vitest'
import { recommendActivity, summarizeProgress } from './academy-progress'
import { createInitialProgress, recordAttempt, recordHint } from './lesson'

const lessons = [{ id: 'lesson-one', title: 'Una lección' }, { id: 'lesson-two', title: 'Otra lección' }]
const reviews = [{ id: 'review-one', title: 'Un repaso' }, { id: 'review-two', title: 'Otro repaso' }]
const complete = (id: string) => recordAttempt(createInitialProgress(id), 'correct')
const finishedLessons = Object.fromEntries(lessons.map((activity) => [activity.id, complete(activity.id)]))

describe('academy progress', () => {
  it('starts with the first pending lesson even if some reviews are solved', () => {
    expect(recommendActivity(lessons, reviews, { 'review-one': complete('review-one') })?.target)
      .toEqual({ mode: 'lessons', activityId: 'lesson-one' })
  })

  it('continues with the next pending lesson', () => {
    expect(recommendActivity(lessons, reviews, { 'lesson-one': complete('lesson-one') })?.target.activityId).toBe('lesson-two')
  })

  it('suggests pending reviews after all lessons', () => {
    expect(recommendActivity(lessons, reviews, finishedLessons)?.target).toEqual({ mode: 'review', activityId: 'review-one' })
  })

  it('suggests an assisted first result for replay when everything is complete', () => {
    const progress = { ...finishedLessons, 'review-one': complete('review-one'), 'review-two': recordAttempt(recordHint(createInitialProgress('review-two')), 'correct') }
    const before = JSON.stringify(progress)
    expect(recommendActivity(lessons, reviews, progress)?.target).toEqual({ mode: 'review', activityId: 'review-two', replay: true })
    expect(JSON.stringify(progress)).toBe(before)
  })

  it('does not mistake a later replay hint for a failed first result', () => {
    const progress = { ...finishedLessons, 'review-one': recordHint(complete('review-one')), 'review-two': complete('review-two') }
    expect(recommendActivity(lessons, reviews, progress)?.reason).toMatch(/Completaste todas/)
  })

  it('does not invent results for legacy records', () => {
    const legacy = { ...complete('review-one'), firstAttemptCorrect: undefined }
    const summary = summarizeProgress(reviews, { 'review-one': legacy })
    expect(summary).toMatchObject({ completed: 1, firstTry: 0, unknownFirstResult: 1 })
    expect(recommendActivity(lessons, reviews, { ...finishedLessons, 'review-one': legacy, 'review-two': complete('review-two') })?.reason).toMatch(/Completaste todas/)
  })

  it('counts only the requested catalog and includes hints before an attempt', () => {
    const progress = { ...finishedLessons, 'review-one': recordHint(createInitialProgress('review-one')) }
    expect(summarizeProgress(reviews, progress)).toEqual({ total: 2, completed: 0, attempts: 0, hints: 1, firstTry: 0, unknownFirstResult: 0 })
  })

  it('handles empty catalogs without a fabricated recommendation', () => {
    expect(recommendActivity([], [], {})).toBeNull()
    expect(summarizeProgress([], {})).toEqual({ total: 0, completed: 0, attempts: 0, hints: 0, firstTry: 0, unknownFirstResult: 0 })
  })
})
