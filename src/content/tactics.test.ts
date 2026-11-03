import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { tactics } from './tactics'
import { lessons } from './lessons'
import { reviewExercises } from './review-exercises'
import { replayTactic, validateTactic } from '../domain/tactics'

describe('curated multi-move tactics', () => {
  it('has stable, independent activity IDs', () => {
    expect(new Set(tactics.map((tactic) => tactic.id)).size).toBe(tactics.length)
    for (const tactic of tactics) {
      expect([...lessons, ...reviewExercises].some((activity) => activity.id === tactic.id)).toBe(false)
    }
  })

  for (const tactic of tactics) {
    it(`validates the alternating line in ${tactic.id}`, () => {
      expect(validateTactic(tactic)).toBe(true)
      expect(tactic.steps.filter((step) => step.actor === 'learner')).toHaveLength(2)
      expect(replayTactic(tactic).moves).toHaveLength(tactic.steps.length)
      for (const step of tactic.steps) {
        if (step.actor === 'learner') {
          expect(step.instruction.length).toBeGreaterThan(0)
          expect(step.hint.length).toBeGreaterThan(0)
        } else expect(step.explanation.length).toBeGreaterThan(0)
      }
    })
  }

  it('verifies the knight fork checks the king and captures the rook after the prepared reply', () => {
    const tactic = tactics[0]
    const game = new Chess(tactic.startFen)
    game.move({ from: 'd5', to: 'f6' })
    expect(game.isCheck()).toBe(true)
    game.move({ from: 'h7', to: 'h6' })
    game.move({ from: 'f6', to: 'g8' })
    expect(game.get('g8')).toEqual({ type: 'n', color: 'w' })
    expect(game.isCheck()).toBe(true)
  })

  it('verifies the prepared queen line ends in checkmate', () => {
    const game = new Chess(tactics[1].startFen)
    game.move({ from: 'd1', to: 'h5' })
    game.move({ from: 'g8', to: 'f6' })
    game.move({ from: 'h5', to: 'f7' })
    expect(game.isCheckmate()).toBe(true)
  })

  it('pins the knight to its king and captures it on a protected square', () => {
    const { game } = replayTactic(tactics[2], 1)
    expect(game.moves({ square: 'd5' })).toEqual([])
    const final = replayTactic(tactics[2]).game
    expect(final.get('d5')).toEqual({ type: 'b', color: 'w' })
    expect(final.moves({ square: 'e6' })).not.toContain('Kxd5')
  })

  it('coordinates the two rooks for ladder mate', () => {
    expect(replayTactic(tactics[3], 1).game.isCheck()).toBe(false)
    expect(replayTactic(tactics[3]).game.isCheckmate()).toBe(true)
  })

  it('uncovers a rook check while the bishop attacks the queen', () => {
    const { game } = replayTactic(tactics[4], 1)
    expect(game.isCheck()).toBe(true)
    expect(game.attackers('e8', 'w')).toContain('e1')
    expect(game.attackers('a6', 'w')).toContain('b5')
    expect(replayTactic(tactics[4]).moves.at(-1)).toBe('Bxa6')
  })

  it('skewers the king and captures the exposed rook', () => {
    expect(replayTactic(tactics[5], 1).game.isCheck()).toBe(true)
    expect(replayTactic(tactics[5]).moves.at(-1)).toBe('Bxf8')
  })
})
