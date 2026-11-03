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
})
