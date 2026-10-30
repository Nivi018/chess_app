import { afterEach, describe, expect, it } from 'vitest'
import { createInitialProgress, loadProgress, recordAttempt, recordHint, saveProgress } from './lesson'

describe('review result integrity', () => {
  afterEach(() => localStorage.clear())

  it('recognizes an unassisted first-attempt solution', () => {
    const result = recordAttempt(createInitialProgress('review'), 'correct')
    expect(result.firstAttemptCorrect).toBe(true)
  })

  it('does not count a hinted solution as unassisted', () => {
    const result = recordAttempt(recordHint(createInitialProgress('review')), 'correct')
    expect(result.hintsUsed).toBe(1)
    expect(result.firstAttemptCorrect).toBe(false)
  })

  it('does not overwrite a failed first attempt after retries or replay', () => {
    const failed = recordAttempt(createInitialProgress('review'), 'other-legal')
    const solved = recordAttempt(failed, 'correct')
    const replayed = recordAttempt(recordHint(solved), 'correct')
    expect(replayed.firstAttemptCorrect).toBe(false)
    expect(replayed.attempts).toBe(3)
    expect(replayed.completedAt).toBe(solved.completedAt)
  })

  it('stores review results without changing lesson progress', () => {
    const lesson = recordAttempt(createInitialProgress('knight-first-move'), 'correct')
    const review = recordHint(createInitialProgress('review-knight-capture-v1'))
    saveProgress(lesson, localStorage)
    saveProgress(review, localStorage)
    expect(loadProgress(localStorage, lesson.lessonId)).toEqual(lesson)
    expect(loadProgress(localStorage, review.lessonId)).toEqual(review)
  })

  it('accepts older progress without fabricating a first-attempt score', () => {
    localStorage.setItem('chess-academy:legacy:v1', JSON.stringify({ lessonId: 'legacy', attempts: 3, completed: true, completedAt: '2026-10-30T12:00:00Z' }))
    const previous = loadProgress(localStorage, 'legacy')
    expect(previous.completed).toBe(true)
    expect(previous.firstAttemptCorrect).toBeUndefined()
  })
})
