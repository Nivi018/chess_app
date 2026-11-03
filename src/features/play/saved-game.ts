import { Chess } from 'chess.js'
import { gameResult } from './game'

export const COMPUTER_GAME_KEY = 'chess-academy:computer-game:v1'
export const MAX_SAVED_PLIES = 2048
const MAX_RECORD_LENGTH = 32_000
const uciMove = /^[a-h][1-8][a-h][1-8][qrbn]?$/

export type GameStorageState = 'empty' | 'saved' | 'invalid' | 'unavailable'
export type SavedGameLoad = { moves: string[]; storageState: GameStorageState }

function validMoves(value: unknown): value is string[] {
  if (!Array.isArray(value) || value.length > MAX_SAVED_PLIES) return false
  const game = new Chess()
  try {
    for (const move of value) {
      if (typeof move !== 'string' || !uciMove.test(move) || gameResult(game)) return false
      // Explicit coordinates prevent a permissive SAN parser from accepting ambiguous records.
      game.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] })
    }
    return true
  } catch { return false }
}

export function loadComputerGame(storage: Pick<Storage, 'getItem'>): SavedGameLoad {
  let raw: string | null
  try { raw = storage.getItem(COMPUTER_GAME_KEY) } catch { return { moves: [], storageState: 'unavailable' } }
  if (raw === null) return { moves: [], storageState: 'empty' }
  try {
    if (raw.length > MAX_RECORD_LENGTH) return { moves: [], storageState: 'invalid' }
    const record: unknown = JSON.parse(raw)
    if (!record || typeof record !== 'object' || !('version' in record) || record.version !== 1 || !('moves' in record) || !validMoves(record.moves)) {
      return { moves: [], storageState: 'invalid' }
    }
    return { moves: record.moves, storageState: 'saved' }
  } catch { return { moves: [], storageState: 'invalid' } }
}

export function saveComputerGame(storage: Pick<Storage, 'setItem'>, moves: string[]): boolean {
  if (!validMoves(moves)) return false
  try {
    // Position, rights, turn and repetition are reconstructed from this one canonical history.
    storage.setItem(COMPUTER_GAME_KEY, JSON.stringify({ version: 1, moves }))
    return true
  } catch { return false }
}

export function loadBrowserComputerGame(): SavedGameLoad {
  try { return loadComputerGame(window.localStorage) } catch { return { moves: [], storageState: 'unavailable' } }
}

export function saveBrowserComputerGame(moves: string[]): boolean {
  try { return saveComputerGame(window.localStorage, moves) } catch { return false }
}
