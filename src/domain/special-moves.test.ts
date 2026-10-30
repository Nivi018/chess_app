import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { classifyLessonMove, promotionChoices, solveExercise, type PromotionPiece } from './lesson'
import { specialMoveLessons } from '../content/lessons/special-moves'
import { reviewSpecialExercises } from '../content/review-special-exercises'
import { lessons } from '../content/lessons'
import { reviewExercises } from '../content/review-exercises'

const [castle, promotion, enPassant] = specialMoveLessons
const [longCastle, knightPromotion, reviewEnPassant] = reviewSpecialExercises

describe('special move rules', () => {
  it('appends special activities after the original ten without replacing them', () => {
    expect(lessons).toHaveLength(13)
    expect(reviewExercises).toHaveLength(13)
    expect(lessons.slice(10)).toEqual(specialMoveLessons)
    expect(reviewExercises.slice(10)).toEqual(reviewSpecialExercises)
  })

  it('moves the king and rook together in kingside castling', () => {
    const result = solveExercise(castle)
    const game = new Chess(result.position)
    expect(result.move.isKingsideCastle()).toBe(true)
    expect(game.get('g1')?.type).toBe('k')
    expect(game.get('f1')?.type).toBe('r')
    expect(game.get('h1')).toBeUndefined()
    expect(game.get('e1')).toBeUndefined()
    expect(result.rookRoute).toEqual({ from: 'h1', to: 'f1' })
  })

  it('moves the rook to d1 in queenside castling and leaves the h1 rook alone', () => {
    const result = solveExercise(longCastle)
    const game = new Chess(result.position)
    expect(result.move.isQueensideCastle()).toBe(true)
    expect(game.get('c1')?.type).toBe('k')
    expect(game.get('d1')?.type).toBe('r')
    expect(game.get('h1')?.type).toBe('r')
    expect(game.get('a1')).toBeUndefined()
    expect(result.rookRoute).toEqual({ from: 'a1', to: 'd1' })
  })

  for (const [reason, fen] of [
    ['missing rights', '4k3/8/8/8/8/8/8/4K2R w - - 0 1'],
    ['an occupied path', '4k3/8/8/8/8/8/8/4KB1R w K - 0 1'],
    ['check at the start', 'k3r3/8/8/8/8/8/8/4K2R w K - 0 1'],
    ['an attacked transit square', 'k4r2/8/8/8/8/8/8/4K2R w K - 0 1'],
    ['an attacked destination', 'k5r1/8/8/8/8/8/8/4K2R w K - 0 1'],
  ]) {
    it(`rejects kingside castling with ${reason}`, () => {
      expect(classifyLessonMove({ ...castle, startFen: fen }, 'e1', 'g1')).toBe('illegal')
    })
  }

  it('requires b1 to be empty for queenside castling, but not safe from attack', () => {
    expect(classifyLessonMove({ ...longCastle, startFen: '4k3/8/8/8/8/8/8/RB2K3 w Q - 0 1' }, 'e1', 'c1')).toBe('illegal')
    expect(classifyLessonMove({ ...longCastle, startFen: '1r5k/8/8/8/8/8/8/R3K3 w Q - 0 1' }, 'e1', 'c1')).toBe('correct')
  })

  it('allows castling even if the rook itself is attacked', () => {
    expect(classifyLessonMove({ ...castle, startFen: 'k6r/8/8/8/8/8/8/4K2R w K - 0 1' }, 'e1', 'g1')).toBe('correct')
  })

  it('does not recover rights when the rook returns to its original square', () => {
    const game = new Chess(castle.startFen)
    for (const move of ['Rh2', 'Kf8', 'Rh1', 'Ke8']) game.move(move)
    expect(classifyLessonMove({ ...castle, startFen: game.fen() }, 'e1', 'g1')).toBe('illegal')
  })

  it('does not recover rights when the king returns to its original square', () => {
    const game = new Chess(castle.startFen)
    for (const move of ['Kf1', 'Kf8', 'Ke1', 'Ke8']) game.move(move)
    expect(classifyLessonMove({ ...castle, startFen: game.fen() }, 'e1', 'g1')).toBe('illegal')
  })

  for (const exercise of [enPassant, reviewEnPassant]) {
    it(`captures the adjacent pawn, not a piece on the destination, in ${exercise.id}`, () => {
      const result = solveExercise(exercise)
      expect(result.move.isEnPassant()).toBe(true)
      expect(result.move.captured).toBe('p')
      const capturedSquare = `${exercise.targetTo[0]}${exercise.targetFrom[1]}` as 'd5' | 'f5'
      const initial = new Chess(exercise.startFen)
      expect(initial.get(exercise.targetTo)).toBeUndefined()
      expect(initial.get(capturedSquare)?.color).toBe('b')
      const final = new Chess(result.position)
      expect(final.get(capturedSquare)).toBeUndefined()
      expect(final.get(exercise.targetTo)).toEqual({ type: 'p', color: 'w' })
    })
  }

  it('rejects en passant without a two-square advance on the immediately preceding turn', () => {
    expect(classifyLessonMove({ ...enPassant, startFen: enPassant.startFen.replace(' d6 ', ' - ') }, 'e5', 'd6')).toBe('illegal')
    const game = new Chess(enPassant.startFen)
    game.move('Ke2')
    game.move('Kf7')
    expect(classifyLessonMove({ ...enPassant, startFen: game.fen() }, 'e5', 'd6')).toBe('illegal')
  })

  it('rejects en passant that exposes the king along a file', () => {
    expect(classifyLessonMove({ ...enPassant, startFen: 'k3r3/8/8/3pP3/8/8/8/4K3 w - d6 0 2' }, 'e5', 'd6')).toBe('illegal')
  })

  it('rejects en passant that exposes the king along a rank after both pawns leave it', () => {
    const exercise = { ...reviewEnPassant, startFen: 'k7/8/8/r4pPK/8/8/8/8 w - f6 0 2' }
    expect(classifyLessonMove(exercise, 'g5', 'f6')).toBe('illegal')
  })

  it('supports a black en-passant move in the shared rules', () => {
    const exercise = { startFen: '4k3/8/8/8/3pP3/8/8/4K3 b - e3 0 2', targetFrom: 'd4', targetTo: 'e3' } as const
    const final = new Chess(solveExercise(exercise).position)
    expect(final.get('e3')).toEqual({ type: 'p', color: 'b' })
    expect(final.get('e4')).toBeUndefined()
  })

  it('requires an explicit promotion piece, rather than auto-selecting the queen', () => {
    expect(promotionChoices(promotion, 'a7', 'a8')).toEqual(['q', 'r', 'b', 'n'])
    expect(classifyLessonMove(promotion, 'a7', 'a8')).toBe('illegal')
    expect(classifyLessonMove(promotion, 'a7', 'a8', 'q')).toBe('correct')
    expect(classifyLessonMove(promotion, 'a7', 'a8', 'k' as PromotionPiece)).toBe('illegal')
    expect(classifyLessonMove(promotion, 'a7', 'a8', 'p' as PromotionPiece)).toBe('illegal')
  })

  for (const piece of ['r', 'b', 'n'] as const) {
    it(`recognizes promotion to ${piece} as legal without completing the queen objective`, () => {
      expect(classifyLessonMove(promotion, 'a7', 'a8', piece)).toBe('other-legal')
    })
  }

  it('restores the correct promoted piece, not a pawn or an automatic queen', () => {
    expect(new Chess(solveExercise(promotion).position).get('a8')).toEqual({ type: 'q', color: 'w' })
    expect(new Chess(solveExercise(knightPromotion).position).get('e8')).toEqual({ type: 'n', color: 'w' })
  })

  it('offers promotion only for legal destinations, including promotion captures', () => {
    expect(promotionChoices(promotion, 'a7', 'b8')).toEqual([])
    const capture = { ...promotion, startFen: '1r6/P6k/8/8/8/8/8/4K3 w - - 0 1', targetTo: 'b8' } as const
    expect(promotionChoices(capture, 'a7', 'b8')).toEqual(['q', 'r', 'b', 'n'])
    expect(solveExercise(capture).move.captured).toBe('r')
  })

  it('supports promotion by black in the shared rules', () => {
    const exercise = { startFen: '4k3/8/8/8/8/7K/1p6/8 b - - 0 1', targetFrom: 'b2', targetTo: 'b1', targetPromotion: 'q' } as const
    expect(new Chess(solveExercise(exercise).position).get('b1')).toEqual({ type: 'q', color: 'b' })
  })

  it('verifies that only the knight promotion gives the requested check', () => {
    for (const piece of ['q', 'r', 'b', 'n'] as const) {
      const game = new Chess(knightPromotion.startFen)
      game.move({ from: 'e7', to: 'e8', promotion: piece })
      expect(game.isCheck()).toBe(piece === 'n')
      expect(classifyLessonMove(knightPromotion, 'e7', 'e8', piece)).toBe(piece === 'n' ? 'correct' : 'other-legal')
    }
  })
})
