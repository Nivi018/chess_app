import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Chess } from 'chess.js'
import { useLesson } from './use-lesson'
import { specialMoveLessons } from '../../../content/lessons/special-moves'
import { reviewSpecialExercises } from '../../../content/review-special-exercises'
import { loadProgress } from '../../../domain/lesson'

describe('special move controller', () => {
  afterEach(() => { cleanup(); localStorage.clear() })

  it('waits for promotion choice and cancels without recording an attempt', () => {
    const exercise = specialMoveLessons[1]
    const changed = vi.fn()
    const { result } = renderHook(() => useLesson(exercise, changed))
    act(() => { result.current.boardOptions.onPieceDrop({ sourceSquare: 'a7', targetSquare: 'a8' }) })
    expect(result.current.pendingPromotion?.choices).toEqual(['q', 'r', 'b', 'n'])
    expect(result.current.progress.attempts).toBe(0)
    expect(result.current.boardOptions.position).toBe(exercise.startFen)
    expect(changed).not.toHaveBeenCalled()
    act(() => { result.current.boardOptions.onPieceDrop({ sourceSquare: 'a7', targetSquare: 'a8' }) })
    expect(result.current.progress.attempts).toBe(0)
    act(() => result.current.cancelPromotion())
    expect(result.current.pendingPromotion).toBeNull()
    expect(changed).not.toHaveBeenCalled()
    expect(loadProgress(localStorage, exercise.id).attempts).toBe(0)
  })

  it('counts a chosen legal alternative once and keeps the exercise at its initial position', () => {
    const exercise = reviewSpecialExercises[1]
    const { result } = renderHook(() => useLesson(exercise, () => {}))
    act(() => { result.current.boardOptions.onPieceDrop({ sourceSquare: 'e7', targetSquare: 'e8' }) })
    act(() => result.current.choosePromotion('q'))
    expect(result.current.progress).toMatchObject({ attempts: 1, completed: false, firstAttemptCorrect: false })
    expect(result.current.feedback.message).toBe(exercise.feedback.otherLegal)
    expect(result.current.boardOptions.position).toBe(exercise.startFen)
    expect(result.current.pendingPromotion).toBeNull()
    act(() => { result.current.boardOptions.onPieceDrop({ sourceSquare: 'e7', targetSquare: 'e8' }) })
    act(() => result.current.choosePromotion('n'))
    expect(new Chess(result.current.boardOptions.position).get('e8')?.type).toBe('n')
    expect(result.current.progress).toMatchObject({ attempts: 2, completed: true, firstAttemptCorrect: false })
  })

  it('persists hints consulted while choosing and restores the solved promotion after reload', () => {
    const exercise = specialMoveLessons[1]
    const { result, unmount } = renderHook(() => useLesson(exercise, () => {}))
    act(() => { result.current.boardOptions.onPieceDrop({ sourceSquare: 'a7', targetSquare: 'a8' }) })
    act(() => result.current.toggleHint())
    act(() => result.current.choosePromotion('q'))
    expect(result.current.progress).toMatchObject({ attempts: 1, hintsUsed: 1, firstAttemptCorrect: false })
    const completedAt = result.current.progress.completedAt
    act(() => result.current.replayLesson())
    expect(result.current.boardOptions.position).toBe(exercise.startFen)
    expect(result.current.pendingPromotion).toBeNull()
    expect(result.current.routeVisible).toBe(false)
    unmount()
    const restored = renderHook(() => useLesson(exercise, () => {}))
    expect(new Chess(restored.result.current.boardOptions.position).get('a8')?.type).toBe('q')
    expect(restored.result.current.progress.completedAt).toBe(completedAt)
  })

  for (const exercise of [specialMoveLessons[0], specialMoveLessons[2], reviewSpecialExercises[0], reviewSpecialExercises[2]]) {
    it(`applies, replays and restores ${exercise.id}`, () => {
      const { result, unmount } = renderHook(() => useLesson(exercise, () => {}))
      act(() => { result.current.boardOptions.onPieceDrop({ sourceSquare: exercise.targetFrom, targetSquare: exercise.targetTo }) })
      const solved = result.current.boardOptions.position
      expect(result.current.progress).toMatchObject({ attempts: 1, completed: true, firstAttemptCorrect: true })
      act(() => result.current.replayLesson())
      expect(result.current.boardOptions.position).toBe(exercise.startFen)
      unmount()
      const restored = renderHook(() => useLesson(exercise, () => {}))
      expect(restored.result.current.boardOptions.position).toBe(solved)
    })
  }
})
