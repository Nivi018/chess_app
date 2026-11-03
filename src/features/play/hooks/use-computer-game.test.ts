import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useComputerGame, type Engine } from './use-computer-game'
import { loadComputerGame } from '../saved-game'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

function engineFixture() {
  const boot = deferred<void>()
  const response = deferred<string>()
  const engine: Engine = { initialized: boot.promise, bestMove: vi.fn(() => response.promise), dispose: vi.fn() }
  return { boot, response, engine }
}

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

describe('computer game controller', () => {
  it('locks loading and thinking, rejects illegal input and applies a legal engine reply', async () => {
    const { engine, boot, response } = engineFixture()
    const factory = () => engine
    const { result, unmount } = renderHook(() => useComputerGame(factory))
    expect(result.current.canPlay).toBe(false)
    act(() => { result.current.applyMove('e2', 'e4') })
    expect(result.current.moves).toEqual([])
    await act(async () => boot.resolve())
    expect(result.current.canPlay).toBe(true)
    act(() => { result.current.applyMove('e2', 'e5') })
    expect(result.current.moves).toEqual([])
    act(() => { result.current.applyMove('e2', 'e4') })
    expect(result.current.state).toBe('thinking')
    expect(engine.bestMove).toHaveBeenCalledExactlyOnceWith(['e2e4'])
    act(() => { result.current.applyMove('d2', 'd4'); result.current.clickSquare('d2') })
    expect(result.current.moves).toEqual(['e2e4'])
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4'])
    await act(async () => response.resolve('e7e5'))
    expect(result.current.game.get('e5')?.color).toBe('b')
    expect(result.current.canPlay).toBe(true)
    expect(result.current.moves).toEqual(['e2e4', 'e7e5'])
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4', 'e7e5'])
    unmount()
    expect(engine.dispose).toHaveBeenCalled()
  })

  it('ignores a late engine response after restart and terminates the prior engine', async () => {
    const first = engineFixture()
    const second = engineFixture()
    const factory = vi.fn().mockReturnValueOnce(first.engine).mockReturnValue(second.engine)
    const { result } = renderHook(() => useComputerGame(factory))
    await act(async () => first.boot.resolve())
    act(() => { result.current.applyMove('e2', 'e4') })
    act(() => result.current.restart())
    expect(first.engine.dispose).toHaveBeenCalled()
    await act(async () => { first.response.resolve('e7e5'); second.boot.resolve() })
    expect(result.current.moves).toEqual([])
    expect(loadComputerGame(localStorage).moves).toEqual([])
    expect(result.current.game.turn()).toBe('w')
    expect(result.current.canPlay).toBe(true)
  })

  it('preserves the position after engine failure and retries with a fresh worker', async () => {
    const first = engineFixture()
    const second = engineFixture()
    const factory = vi.fn().mockReturnValueOnce(first.engine).mockReturnValue(second.engine)
    const { result } = renderHook(() => useComputerGame(factory))
    await act(async () => first.boot.resolve())
    act(() => { result.current.applyMove('e2', 'e4') })
    await act(async () => first.response.reject(new Error('Offline')))
    expect(result.current.state).toBe('error')
    const position = result.current.game.fen()
    act(() => result.current.retry())
    await act(async () => second.boot.resolve())
    expect(result.current.game.fen()).toBe(position)
    expect(second.engine.bestMove).toHaveBeenCalledWith(['e2e4'])
    await act(async () => second.response.resolve('e7e6'))
    expect(result.current.moves).toEqual(['e2e4', 'e7e6'])
  })

  it('rejects a syntactically valid but illegal engine reply without corrupting the board', async () => {
    const { engine, boot, response } = engineFixture()
    const factory = () => engine
    const { result } = renderHook(() => useComputerGame(factory))
    await act(async () => boot.resolve())
    act(() => { result.current.applyMove('e2', 'e4') })
    await act(async () => response.resolve('e7e3'))
    expect(result.current.state).toBe('error')
    expect(result.current.moves).toEqual(['e2e4'])
    expect(result.current.game.get('e7')?.color).toBe('b')
  })

  it('handles unsupported workers and rejected boot, without touching academy storage', async () => {
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const broken = () => { throw new Error('No Worker') }
    const { result } = renderHook(() => useComputerGame(broken))
    expect(result.current.state).toBe('error')
    expect(result.current.error).toMatch(/WebAssembly/)
    const fixture = engineFixture()
    const factory = () => fixture.engine
    const other = renderHook(() => useComputerGame(factory))
    await act(async () => fixture.boot.reject(new Error('Load failed')))
    expect(other.result.current.error).toBe('Load failed')
    expect(write).not.toHaveBeenCalled()
  })

  it('requires an explicit promotion, allows cancel and records the chosen knight', async () => {
    const replies = ['b7b5', 'a7a6', 'h7h6', 'h6h5']
    const engine: Engine = { initialized: Promise.resolve(), bestMove: vi.fn(() => Promise.resolve(replies.shift() ?? 'a8b8')), dispose: vi.fn() }
    const factory = () => engine
    const { result } = renderHook(() => useComputerGame(factory))
    await waitFor(() => expect(result.current.canPlay).toBe(true))
    for (const [from, to] of [['a2', 'a4'], ['a4', 'b5'], ['b5', 'a6'], ['a6', 'a7']]) {
      await act(async () => { result.current.applyMove(from, to) })
    }
    act(() => { result.current.applyMove('a7', 'b8') })
    expect(result.current.promotion?.choices.sort()).toEqual(['b', 'n', 'q', 'r'])
    expect(result.current.moves).toHaveLength(8)
    expect(loadComputerGame(localStorage).moves).toHaveLength(8)
    expect(result.current.canPlay).toBe(false)
    act(() => result.current.cancelPromotion())
    expect(result.current.game.get('a7')?.type).toBe('p')
    act(() => { result.current.applyMove('a7', 'b8') })
    // Resolve this reply later so the promoted piece remains observable.
    vi.mocked(engine.bestMove).mockReturnValueOnce(new Promise(() => {}))
    act(() => { result.current.choosePromotion('n') })
    expect(result.current.game.get('b8')).toEqual({ type: 'n', color: 'w' })
    expect(result.current.moves.at(-1)).toBe('a7b8n')
    expect(loadComputerGame(localStorage).moves.at(-1)).toBe('a7b8n')
  })

  it('ends on mate and never requests another move', async () => {
    const replies = ['e7e5', 'd8h4']
    const engine: Engine = { initialized: Promise.resolve(), bestMove: vi.fn(() => Promise.resolve(replies.shift()!)), dispose: vi.fn() }
    const factory = () => engine
    const { result } = renderHook(() => useComputerGame(factory))
    await waitFor(() => expect(result.current.canPlay).toBe(true))
    await act(async () => { result.current.applyMove('f2', 'f3') })
    await act(async () => { result.current.applyMove('g2', 'g4') })
    expect(result.current.result).toBe('Jaque mate. Ganan las negras.')
    expect(result.current.feedback).toContain('Jaque mate. Ganan las negras.')
    expect(result.current.feedback).not.toContain('Tu turno')
    expect(result.current.canPlay).toBe(false)
    expect(engine.bestMove).toHaveBeenCalledTimes(2)
  })
})
