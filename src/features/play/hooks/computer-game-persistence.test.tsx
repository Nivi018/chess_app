import { StrictMode, type ReactNode } from 'react'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPUTER_GAME_KEY, loadComputerGame, saveComputerGame } from '../saved-game'
import { replayGame } from '../game'
import { useComputerGame, type Engine } from './use-computer-game'

function engine(reply?: string): Engine {
  return { initialized: Promise.resolve(), bestMove: vi.fn(() => reply ? Promise.resolve(reply) : new Promise<string>(() => {})), dispose: vi.fn() }
}

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

describe('save and resume computer play', () => {
  it('restores a white turn and exact history without starting an extra black search or rewriting on mount', async () => {
    const moves = ['e2e4', 'e7e5']
    saveComputerGame(localStorage, moves)
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    const current = engine()
    const factory = () => current
    const { result } = renderHook(() => useComputerGame(factory))
    await waitFor(() => expect(result.current.canPlay).toBe(true))
    expect(result.current.restored).toBe(true)
    expect(result.current.game.fen()).toBe(replayGame(moves).fen())
    expect(result.current.game.history()).toEqual(['e4', 'e5'])
    expect(current.bestMove).not.toHaveBeenCalled()
    expect(writes).not.toHaveBeenCalled()
  })

  it('resumes a saved black turn once and persists its reply', async () => {
    saveComputerGame(localStorage, ['e2e4'])
    const current = engine('e7e6')
    const factory = () => current
    const { result } = renderHook(() => useComputerGame(factory))
    expect(result.current.canPlay).toBe(false)
    await waitFor(() => expect(result.current.moves).toEqual(['e2e4', 'e7e6']))
    expect(current.bestMove).toHaveBeenCalledExactlyOnceWith(['e2e4'])
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4', 'e7e6'])
  })

  it('keeps the saved black-turn boundary when unmounting and ignores a late reply after reopening', async () => {
    let respond!: (move: string) => void
    const first = engine()
    vi.mocked(first.bestMove).mockReturnValue(new Promise((resolve) => { respond = resolve }))
    const firstFactory = () => first
    const original = renderHook(() => useComputerGame(firstFactory))
    await waitFor(() => expect(original.result.current.canPlay).toBe(true))
    act(() => { original.result.current.applyMove('e2', 'e4') })
    original.unmount()
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4'])
    const second = engine('e7e6')
    const secondFactory = () => second
    const reopened = renderHook(() => useComputerGame(secondFactory))
    await waitFor(() => expect(reopened.result.current.moves).toEqual(['e2e4', 'e7e6']))
    await act(async () => respond('e7e5'))
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4', 'e7e6'])
  })

  it('restores a finished mate or drawn game without booting an engine', () => {
    for (const moves of [
      ['f2f3', 'e7e5', 'g2g4', 'd8h4'],
      ['g1f3', 'g8f6', 'f3g1', 'f6g8', 'g1f3', 'g8f6', 'f3g1', 'f6g8'],
    ]) {
      saveComputerGame(localStorage, moves)
      const factory = vi.fn(() => engine())
      const restored = renderHook(() => useComputerGame(factory))
      expect(restored.result.current.result).toBeTruthy()
      expect(restored.result.current.canPlay).toBe(false)
      expect(factory).not.toHaveBeenCalled()
      restored.unmount()
    }
  })

  it('does not restore a promotion before its explicit choice was confirmed', async () => {
    const moves = ['a2a4', 'b7b5', 'a4b5', 'a7a6', 'b5a6', 'h7h6', 'a6a7', 'h6h5']
    saveComputerGame(localStorage, moves)
    const factory = () => engine()
    const first = renderHook(() => useComputerGame(factory))
    await waitFor(() => expect(first.result.current.canPlay).toBe(true))
    act(() => { first.result.current.applyMove('a7', 'b8') })
    expect(first.result.current.promotion).toBeTruthy()
    first.unmount()
    const recovered = renderHook(() => useComputerGame(factory))
    expect(recovered.result.current.promotion).toBeNull()
    expect(recovered.result.current.game.get('a7')?.type).toBe('p')
    expect(recovered.result.current.moves).toEqual(moves)
  })

  it('blocks invalid records without overwriting them, then explicitly replaces them on restart', async () => {
    localStorage.setItem(COMPUTER_GAME_KEY, '{damaged')
    const factory = vi.fn(() => engine())
    const { result } = renderHook(() => useComputerGame(factory))
    expect(result.current.recoveryBlocked).toBe(true)
    act(() => { result.current.applyMove('e2', 'e4'); result.current.retrySave() })
    expect(localStorage.getItem(COMPUTER_GAME_KEY)).toBe('{damaged')
    expect(factory).not.toHaveBeenCalled()
    act(() => result.current.restart())
    await waitFor(() => expect(result.current.canPlay).toBe(true))
    expect(loadComputerGame(localStorage)).toEqual({ moves: [], storageState: 'saved' })
  })

  it('retries a failed read without overwriting the unknown game', async () => {
    saveComputerGame(localStorage, ['e2e4', 'e7e5'])
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Blocked') })
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const factory = () => engine()
    const { result } = renderHook(() => useComputerGame(factory))
    expect(result.current.storageState).toBe('unavailable')
    expect(result.current.canPlay).toBe(false)
    act(() => result.current.retrySave())
    expect(write).not.toHaveBeenCalled()
    read.mockRestore()
    act(() => result.current.retryRestore())
    await waitFor(() => expect(result.current.canPlay).toBe(true))
    expect(result.current.moves).toEqual(['e2e4', 'e7e5'])
    expect(write).not.toHaveBeenCalled()
  })

  it('retains live moves on quota failure, reports unsaved state and retries the latest snapshot', async () => {
    const current = engine('e7e5')
    const factory = () => current
    const { result } = renderHook(() => useComputerGame(factory))
    await waitFor(() => expect(result.current.canPlay).toBe(true))
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota') })
    await act(async () => { result.current.applyMove('e2', 'e4') })
    expect(result.current.moves).toEqual(['e2e4', 'e7e5'])
    expect(result.current.storageState).toBe('unavailable')
    write.mockRestore()
    act(() => result.current.retrySave())
    expect(result.current.storageState).toBe('saved')
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4', 'e7e5'])
  })

  it('waits for engine initialization when recovery retry finds a black turn', async () => {
    saveComputerGame(localStorage, ['e2e4'])
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Blocked') })
    let ready!: () => void
    const current: Engine = { ...engine('e7e5'), initialized: new Promise<void>((resolve) => { ready = resolve }) }
    const factory = () => current
    const { result } = renderHook(() => useComputerGame(factory))
    read.mockRestore()
    act(() => result.current.retryRestore())
    expect(result.current.state).toBe('loading')
    expect(current.bestMove).not.toHaveBeenCalled()
    await act(async () => ready())
    expect(current.bestMove).toHaveBeenCalledExactlyOnceWith(['e2e4'])
    expect(result.current.moves).toEqual(['e2e4', 'e7e5'])
  })

  it('warns when replacing the old saved game fails instead of claiming it was discarded', async () => {
    saveComputerGame(localStorage, ['e2e4', 'e7e5'])
    const factory = () => engine()
    const { result } = renderHook(() => useComputerGame(factory))
    await waitFor(() => expect(result.current.canPlay).toBe(true))
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Blocked') })
    act(() => result.current.restart())
    expect(result.current.moves).toEqual([])
    expect(result.current.storageState).toBe('unavailable')
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4', 'e7e5'])
    write.mockRestore()
    act(() => result.current.retrySave())
    expect(loadComputerGame(localStorage).moves).toEqual([])
  })

  it('does not erase saved history or duplicate black responses in Strict Mode', async () => {
    saveComputerGame(localStorage, ['e2e4'])
    const workers: Engine[] = []
    const factory = () => { const current = engine('e7e5'); workers.push(current); return current }
    const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>
    const { result, unmount } = renderHook(() => useComputerGame(factory), { wrapper })
    await waitFor(() => expect(result.current.moves).toEqual(['e2e4', 'e7e5']))
    expect(workers.flatMap((worker) => vi.mocked(worker.bestMove).mock.calls)).toHaveLength(1)
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4', 'e7e5'])
    unmount()
    workers.forEach((worker) => expect(worker.dispose).toHaveBeenCalled())
  })
})
