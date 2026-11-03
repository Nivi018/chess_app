import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPUTER_GAME_KEY, MAX_SAVED_PLIES, loadComputerGame, saveComputerGame } from './saved-game'
import { gameResult, replayGame } from './game'

afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })

describe('independent local computer-game record', () => {
  it('saves canonical history under its own versioned key, not a lesson result', () => {
    localStorage.setItem('chess-academy:lesson-knight:v1', 'existing lesson')
    expect(loadComputerGame(localStorage)).toEqual({ moves: [], storageState: 'empty' })
    expect(saveComputerGame(localStorage, ['e2e4', 'e7e5'])).toBe(true)
    expect(JSON.parse(localStorage.getItem(COMPUTER_GAME_KEY)!)).toEqual({ version: 1, moves: ['e2e4', 'e7e5'] })
    expect(loadComputerGame(localStorage)).toEqual({ moves: ['e2e4', 'e7e5'], storageState: 'saved' })
    expect(localStorage.getItem('chess-academy:lesson-knight:v1')).toBe('existing lesson')
  })

  for (const record of [
    '{broken', 'null', '[]', '{}', JSON.stringify({ version: 2, moves: ['e2e4'] }),
    JSON.stringify({ version: 1, moves: ['e4'] }), JSON.stringify({ version: 1, moves: ['e2e5'] }),
    JSON.stringify({ version: 1, moves: ['e2e4', 'd2d4'] }), JSON.stringify({ version: 1, moves: [4] }),
    JSON.stringify({ version: 1, moves: 'e2e4' }), JSON.stringify({ version: 1, moves: Array(MAX_SAVED_PLIES + 1).fill('g1f3') }),
    ' '.repeat(32_001),
  ]) {
    it(`rejects malformed/unsupported/illegal records without overwriting them (${record.slice(0, 45)})`, () => {
      localStorage.setItem(COMPUTER_GAME_KEY, record)
      expect(loadComputerGame(localStorage)).toEqual({ moves: [], storageState: 'invalid' })
      expect(localStorage.getItem(COMPUTER_GAME_KEY)).toBe(record)
    })
  }

  it('rejects moves after an already terminated game', () => {
    const mate = ['f2f3', 'e7e5', 'g2g4', 'd8h4']
    expect(saveComputerGame(localStorage, mate)).toBe(true)
    expect(saveComputerGame(localStorage, [...mate, 'a2a3'])).toBe(false)
    expect(loadComputerGame(localStorage).moves).toEqual(mate)
  })

  it('preserves castling rights, en passant, underpromotion and repetition by replay', () => {
    const lines = [
      ['g1f3', 'a7a6', 'g2g3', 'a6a5', 'f1g2', 'b7b6', 'e1g1'],
      ['e2e4', 'a7a6', 'e4e5', 'd7d5'],
      ['a2a4', 'b7b5', 'a4b5', 'a7a6', 'b5a6', 'h7h6', 'a6a7', 'h6h5', 'a7b8n'],
      ['g1f3', 'g8f6', 'f3g1', 'f6g8', 'g1f3', 'g8f6', 'f3g1', 'f6g8'],
    ]
    for (const moves of lines) {
      expect(saveComputerGame(localStorage, moves)).toBe(true)
      const recovered = replayGame(loadComputerGame(localStorage).moves)
      expect(recovered.fen()).toBe(replayGame(moves).fen())
      expect(recovered.history()).toEqual(replayGame(moves).history())
    }
    expect(gameResult(replayGame(loadComputerGame(localStorage).moves))).toMatch(/repetición/)
    saveComputerGame(localStorage, lines[1])
    expect(replayGame(loadComputerGame(localStorage).moves).moves()).toContain('exd6')
  })

  it('reports read/write failures and leaves the last successful snapshot intact', () => {
    expect(loadComputerGame({ getItem: () => { throw new Error('Blocked') } }).storageState).toBe('unavailable')
    saveComputerGame(localStorage, ['e2e4'])
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota') })
    expect(saveComputerGame(localStorage, ['e2e4', 'e7e5'])).toBe(false)
    expect(loadComputerGame(localStorage).moves).toEqual(['e2e4'])
  })

  it('replaces a prior game with an empty record when starting another', () => {
    saveComputerGame(localStorage, ['e2e4', 'e7e5'])
    expect(saveComputerGame(localStorage, [])).toBe(true)
    expect(loadComputerGame(localStorage)).toEqual({ moves: [], storageState: 'saved' })
  })
})
