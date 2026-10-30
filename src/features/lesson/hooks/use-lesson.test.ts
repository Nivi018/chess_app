import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { lessons } from '../../../content/lessons'
import { createInitialProgress, loadProgress, recordAttempt, saveProgress } from '../../../domain/lesson'
import { useLesson } from './use-lesson'

describe('reusable lesson controller', () => {
  afterEach(() => { cleanup(); localStorage.clear() })

  it('preserves existing knight progress and isolates the new rook lesson', () => {
    const previous = recordAttempt(createInitialProgress(), 'correct')
    saveProgress(previous, localStorage)
    const { result } = renderHook(() => useLesson(lessons[1], () => {}))
    expect(result.current.progress.completed).toBe(false)
    act(() => { result.current.boardOptions.onPieceDrop({ sourceSquare: 'a1', targetSquare: 'a4' }) })
    expect(result.current.progress.completed).toBe(true)
    expect(loadProgress(localStorage)).toEqual(previous)
    expect(loadProgress(localStorage, lessons[1].id).completed).toBe(true)
  })

  it('resets interaction for replay without losing completion, then restores on reload', () => {
    const { result, unmount } = renderHook(() => useLesson(lessons[1], () => {}))
    act(() => { result.current.boardOptions.onPieceDrop({ sourceSquare: 'a1', targetSquare: 'a4' }) })
    const firstCompletedAt = result.current.progress.completedAt
    act(() => result.current.replayLesson())
    expect(result.current.replaying).toBe(true)
    expect(result.current.routeVisible).toBe(false)
    expect(result.current.progress.completed).toBe(true)
    act(() => { result.current.boardOptions.onPieceDrop({ sourceSquare: 'a1', targetSquare: 'a4' }) })
    expect(result.current.replaying).toBe(false)
    expect(result.current.progress.completedAt).toBe(firstCompletedAt)
    unmount()
    const restored = renderHook(() => useLesson(lessons[1], () => {}))
    expect(restored.result.current.routeVisible).toBe(true)
    expect(restored.result.current.progress.attempts).toBe(2)
  })

  it('accepts legal alternatives as feedback without completing or moving the exercise', () => {
    const { result } = renderHook(() => useLesson(lessons[1], () => {}))
    act(() => { result.current.boardOptions.onPieceDrop({ sourceSquare: 'a1', targetSquare: 'a3' }) })
    expect(result.current.progress.completed).toBe(false)
    expect(result.current.feedback.message).toBe(lessons[1].feedback.otherLegal)
    expect(result.current.boardOptions.position).toBe(lessons[1].startFen)
  })
})
