import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Chess } from 'chess.js'
import { tactics } from '../../../content/tactics'
import { createInitialProgress, loadProgress, type LessonProgress } from '../../../domain/lesson'
import { useTactic } from './use-tactic'

describe('multi-move tactic controller', () => {
  afterEach(() => { cleanup(); localStorage.clear() })

  for (const tactic of tactics.slice(2)) {
    it(`solves and restores ${tactic.id} with step-specific hints`, () => {
      let progress = createInitialProgress(tactic.id)
      const { result, unmount } = renderHook(() => useTactic(tactic, progress, (next) => { progress = next }))
      for (const step of tactic.steps) {
        if (step.actor === 'learner') {
          expect(result.current.currentHint).toBe(step.hint)
          act(() => result.current.onPieceDrop({ sourceSquare: step.from, targetSquare: step.to }))
        } else act(() => result.current.showPreparedReply())
      }
      expect(progress).toMatchObject({ completed: true, attempts: 1, firstAttemptCorrect: true })
      const position = result.current.position
      unmount()
      const restored = renderHook(() => useTactic(tactic, loadProgress(localStorage, tactic.id)))
      expect(restored.result.current.position).toBe(position)
      expect(restored.result.current.completed).toBe(true)
    })
  }

  it('rejects a legal alternative and waits for an explicit prepared reply with input locked', () => {
    const tactic = tactics[0]
    let progress = createInitialProgress(tactic.id)
    const changed = vi.fn((next: LessonProgress) => { progress = next })
    const { result } = renderHook(() => useTactic(tactic, progress, changed))
    act(() => result.current.onPieceDrop({ sourceSquare: 'd5', targetSquare: 'c7' }))
    expect(result.current.feedback.tone).toBe('try-again')
    expect(result.current.position).toBe(tactic.startFen)
    expect(progress).toMatchObject({ attempts: 1, completed: false, firstAttemptCorrect: false })
    act(() => result.current.onPieceDrop({ sourceSquare: 'd5', targetSquare: 'f6' }))
    expect(result.current.waitingForReply).toBe(true)
    expect(result.current.canPlay).toBe(false)
    expect(result.current.moveOptions).toEqual([])
    expect(new Chess(result.current.position).get('h7')?.type).toBe('k')
    const waitingPosition = result.current.position
    act(() => result.current.onPieceDrop({ sourceSquare: 'f6', targetSquare: 'g8' }))
    act(() => result.current.onSquareClick('h7'))
    act(() => result.current.toggleHint())
    expect(result.current.position).toBe(waitingPosition)
    expect(progress.attempts).toBe(1)
    expect(progress.hintsUsed ?? 0).toBe(0)
    act(() => result.current.showPreparedReply())
    const positionAfterReply = new Chess(result.current.position)
    expect(positionAfterReply.get('h6')?.type).toBe('k')
    expect(positionAfterReply.get('f6')?.type).toBe('n')
    expect(result.current.lineSan).toEqual(['Nf6+', 'Kh6'])
    expect(result.current.feedback.message).toMatch(/respuesta rival preparada: Kh6/i)
    expect(progress.attempts).toBe(1)
    act(() => result.current.onPieceDrop({ sourceSquare: 'f6', targetSquare: 'g8' }))
    expect(progress).toMatchObject({ attempts: 2, completed: true, firstAttemptCorrect: false })
    expect(result.current.routeVisible).toBe(true)
  })

  it('counts a complete solution as one attempt and stores only the completed line', () => {
    const tactic = tactics[1]
    let progress = createInitialProgress(tactic.id)
    const changed = vi.fn((next: LessonProgress) => { progress = next })
    const { result } = renderHook(() => useTactic(tactic, progress, changed))
    act(() => result.current.onPieceDrop({ sourceSquare: 'd1', targetSquare: 'h5' }))
    expect(progress.attempts).toBe(0)
    expect(result.current.lineSan).toEqual(['Qh5'])
    act(() => result.current.showPreparedReply())
    expect(result.current.lineSan).toEqual(['Qh5', 'Nf6'])
    expect(new Chess(result.current.position).isCheckmate()).toBe(false)
    act(() => result.current.onPieceDrop({ sourceSquare: 'h5', targetSquare: 'f7' }))
    expect(progress).toMatchObject({ attempts: 1, completed: true, firstAttemptCorrect: true })
    expect(new Chess(result.current.position).isCheckmate()).toBe(true)
    expect(loadProgress(localStorage, tactic.id)).toEqual(progress)
  })

  it('records a hint and a wrong move, preserving the first-result mark after solving', () => {
    const tactic = tactics[0]
    let progress = createInitialProgress(tactic.id)
    const changed = vi.fn((next: LessonProgress) => { progress = next })
    const { result } = renderHook(() => useTactic(tactic, progress, changed))
    act(() => result.current.toggleHint())
    act(() => result.current.onPieceDrop({ sourceSquare: 'd5', targetSquare: 'b4' }))
    act(() => result.current.onPieceDrop({ sourceSquare: 'd5', targetSquare: 'f6' }))
    expect(result.current.hintVisible).toBe(false)
    expect(result.current.currentHint).toBe('')
    act(() => result.current.showPreparedReply())
    expect(result.current.currentHint).toBe(tactic.steps[2].actor === 'learner' ? tactic.steps[2].hint : '')
    act(() => result.current.onPieceDrop({ sourceSquare: 'f6', targetSquare: 'g8' }))
    expect(progress).toMatchObject({ attempts: 2, hintsUsed: 1, completed: true, firstAttemptCorrect: false })
  })

  it('replays and restores the solved variation without replacing the first result', () => {
    const tactic = tactics[1]
    let progress = createInitialProgress(tactic.id)
    const changed = vi.fn((next: LessonProgress) => { progress = next })
    const { result, unmount } = renderHook(() => useTactic(tactic, progress, changed))
    act(() => result.current.onPieceDrop({ sourceSquare: 'd1', targetSquare: 'h5' }))
    act(() => result.current.showPreparedReply())
    act(() => result.current.onPieceDrop({ sourceSquare: 'h5', targetSquare: 'f7' }))
    const completedAt = progress.completedAt
    act(() => result.current.replayTactic())
    expect(result.current.position).toBe(tactic.startFen)
    expect(result.current.completed).toBe(false)
    act(() => result.current.onPieceDrop({ sourceSquare: 'd1', targetSquare: 'h5' }))
    act(() => result.current.showPreparedReply())
    act(() => result.current.onPieceDrop({ sourceSquare: 'h5', targetSquare: 'f7' }))
    expect(progress).toMatchObject({ attempts: 2, completed: true, firstAttemptCorrect: true, completedAt })
    unmount()
    const restored = renderHook(() => useTactic(tactic, progress, vi.fn()))
    expect(new Chess(restored.result.current.position).isCheckmate()).toBe(true)
    expect(restored.result.current.completed).toBe(true)
  })

  it('restarts an incomplete line after reload without losing its saved hint', () => {
    const tactic = tactics[0]
    let progress = createInitialProgress(tactic.id)
    const { result, unmount } = renderHook(() => useTactic(tactic, progress, (next) => { progress = next }))
    act(() => result.current.toggleHint())
    act(() => result.current.onPieceDrop({ sourceSquare: 'd5', targetSquare: 'f6' }))
    expect(result.current.stepIndex).toBe(1)
    unmount()
    const restored = renderHook(() => useTactic(tactic, loadProgress(localStorage, tactic.id)))
    expect(restored.result.current.position).toBe(tactic.startFen)
    expect(restored.result.current.stepIndex).toBe(0)
    expect(loadProgress(localStorage, tactic.id)).toMatchObject({ attempts: 0, hintsUsed: 1, completed: false })
  })
})
