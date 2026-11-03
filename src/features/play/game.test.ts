import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { gameResult, replayGame } from './game'

describe('free game rules', () => {
  it('restores history so threefold repetition is detected', () => {
    const game = replayGame(['g1f3', 'g8f6', 'f3g1', 'f6g8', 'g1f3', 'g8f6', 'f3g1', 'f6g8'])
    expect(gameResult(game)).toMatch(/repetición/)
  })
  it('distinguishes stalemate, material, fifty-move draws and mate', () => {
    expect(gameResult(new Chess('7k/5K2/6Q1/8/8/8/8/8 b - - 0 1'))).toMatch(/ahogado/)
    expect(gameResult(new Chess('7k/8/8/8/8/8/8/K7 w - - 0 1'))).toMatch(/material insuficiente/)
    expect(gameResult(new Chess('7k/8/8/8/8/8/8/KR6 w - - 100 51'))).toMatch(/cincuenta/)
    expect(gameResult(replayGame(['e2e4', 'e7e5', 'f1c4', 'b8c6', 'd1h5', 'g8f6', 'h5f7']))).toBe('Jaque mate. Ganan las blancas.')
    expect(gameResult(new Chess())).toBeNull()
  })
  it('retains castling rights and en passant through the full game history', () => {
    const castle = replayGame(['g1f3', 'a7a6', 'g2g3', 'a6a5', 'f1g2', 'b7b6', 'e1g1'])
    expect(castle.get('f1')?.type).toBe('r')
    expect(castle.get('g1')?.type).toBe('k')
    const passant = replayGame(['e2e4', 'a7a6', 'e4e5', 'd7d5', 'e5d6'])
    expect(passant.get('d5')).toBeUndefined()
    expect(passant.get('d6')?.color).toBe('w')
  })
})
