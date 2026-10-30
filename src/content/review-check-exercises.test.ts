import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { reviewCheckExercises } from './review-check-exercises'
import { reviewExercises } from './review-exercises'
import { classifyLessonMove } from '../domain/lesson'

describe('check review accuracy', () => {
  it('keeps the six original review IDs in their original order', () => {
    expect(reviewExercises.slice(0, 6).map((exercise) => exercise.id)).toEqual([
      'review-knight-capture-v1', 'review-rook-capture-v1', 'review-bishop-capture-v1',
      'review-queen-capture-v1', 'review-king-capture-v1', 'review-pawn-capture-v1',
    ])
    expect(reviewExercises.slice(6)).toEqual(reviewCheckExercises)
  })

  for (const exercise of reviewCheckExercises.slice(0, 3)) {
    it(`offers a unique defense with the requested piece in ${exercise.id}`, () => {
      const game = new Chess(exercise.startFen)
      expect(game.isCheck()).toBe(true)
      expect(game.moves({ square: exercise.targetFrom, verbose: true }).map((move) => move.to)).toEqual([exercise.targetTo])
      game.move({ from: exercise.targetFrom, to: exercise.targetTo })
      const whiteToMove = new Chess(game.fen().replace(' b ', ' w '))
      expect(whiteToMove.isCheck()).toBe(false)
      expect(game.isGameOver()).toBe(false)
    })
  }

  it('rejects both the rook attack and proximity to the black king', () => {
    const escape = reviewCheckExercises[0]
    expect(classifyLessonMove(escape, 'a1', 'a2')).toBe('illegal')
    expect(classifyLessonMove(escape, 'a1', 'b2')).toBe('illegal')
  })

  it('blocks the checking rook without capturing it or moving the king', () => {
    const block = reviewCheckExercises[1]
    expect(classifyLessonMove(block, 'a2', 'g2')).toBe('illegal')
    const game = new Chess(block.startFen)
    expect(game.move({ from: 'a2', to: 'h2' }).captured).toBeUndefined()
    expect(game.get('h1')?.type).toBe('k')
    expect(game.get('h8')?.type).toBe('r')
  })

  it('requires capturing the knight rather than trying to block its jump', () => {
    const capture = reviewCheckExercises[2]
    expect(classifyLessonMove(capture, 'h5', 'e2')).toBe('illegal')
    const game = new Chess(capture.startFen)
    expect(game.move({ from: 'h5', to: 'f3' }).captured).toBe('n')
    expect(game.get('e1')?.type).toBe('k')
  })

  it('has exactly one mating move with the rook and distinguishes a mere check', () => {
    const mate = reviewCheckExercises[3]
    const game = new Chess(mate.startFen)
    expect(game.isCheck()).toBe(false)
    const mates = game.moves({ square: mate.targetFrom, verbose: true }).filter((move) => {
      const position = new Chess(mate.startFen)
      position.move(move)
      return position.isCheckmate()
    })
    expect(mates.map((move) => move.to)).toEqual(['h1'])
    game.move({ from: 'a1', to: 'h1' })
    expect(game.isCheck()).toBe(true)
    expect(game.isCheckmate()).toBe(true)
    expect(game.isStalemate()).toBe(false)
    expect(game.get('h8')?.type).toBe('k')
    const checkOnly = new Chess(mate.startFen)
    checkOnly.move({ from: 'a1', to: 'a8' })
    expect(checkOnly.isCheck()).toBe(true)
    expect(checkOnly.isCheckmate()).toBe(false)
    expect(classifyLessonMove(mate, 'a1', 'a8')).toBe('other-legal')
  })
})
