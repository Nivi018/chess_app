import { afterEach, describe, expect, it } from 'vitest'
import {
  classifyKnightMove,
  createInitialProgress,
  loadProgress,
  recordAttempt,
  saveProgress,
} from './lesson'

describe('first knight lesson', () => {
  it('accepts the explained move from b1 to c3', () => {
    expect(classifyKnightMove('b1', 'c3')).toBe('correct')
  })

  it('recognizes another legal knight move without marking the exercise complete', () => {
    expect(classifyKnightMove('b1', 'a3')).toBe('other-legal')
  })

  it('rejects an illegal move and moves made with another piece', () => {
    expect(classifyKnightMove('b1', 'b3')).toBe('illegal')
    expect(classifyKnightMove('a1', 'a2')).toBe('wrong-piece')
  })

  it('records attempts and keeps the first successful completion time', () => {
    const initial = createInitialProgress()
    const tried = recordAttempt(initial, 'other-legal', '2026-10-30T10:00:00.000Z')
    const completed = recordAttempt(tried, 'correct', '2026-10-30T10:01:00.000Z')
    const retried = recordAttempt(completed, 'correct', '2026-10-30T10:02:00.000Z')

    expect(tried).toMatchObject({ attempts: 1, completed: false, completedAt: null })
    expect(completed).toMatchObject({
      attempts: 2,
      completed: true,
      completedAt: '2026-10-30T10:01:00.000Z',
    })
    expect(retried.completedAt).toBe('2026-10-30T10:01:00.000Z')
  })
})

describe('local progress storage', () => {
  afterEach(() => localStorage.clear())

  it('round-trips progress in browser storage', () => {
    const progress = recordAttempt(createInitialProgress(), 'correct', '2026-10-30T10:00:00.000Z')

    expect(saveProgress(progress, localStorage)).toBe(true)
    expect(loadProgress(localStorage)).toEqual(progress)
  })

  it('starts safely when stored data is malformed', () => {
    localStorage.setItem('chess-academy:knight-first-move:v1', '{bad json')

    expect(loadProgress(localStorage)).toEqual(createInitialProgress())
  })
})
