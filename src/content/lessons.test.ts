import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { lessons } from './lessons'
import { classifyLessonMove } from '../domain/lesson'

describe('published lesson catalog', () => {
  it('has unique, stable lesson IDs', () => {
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(lessons.length)
  })

  it('covers all six pieces without changing the existing lesson IDs', () => {
    expect(lessons.map((lesson) => new Chess(lesson.startFen).get(lesson.targetFrom)?.type))
      .toEqual(['n', 'r', 'b', 'q', 'k', 'p'])
    expect(lessons.slice(0, 2).map((lesson) => lesson.id)).toEqual(['knight-first-move', 'rook-first-move'])
  })

  for (const lesson of lessons) {
    it(`validates the position and solution of ${lesson.id}`, () => {
      const game = new Chess(lesson.startFen)
      expect(game.get(lesson.targetFrom)).toBeDefined()
      expect(classifyLessonMove(lesson, lesson.targetFrom, lesson.targetTo)).toBe('correct')
      expect(() => game.move({ from: lesson.targetFrom, to: lesson.targetTo })).not.toThrow()
    })
  }

  it('distinguishes a legal rook alternative from the requested solution', () => {
    const rook = lessons[1]
    expect(classifyLessonMove(rook, 'a1', 'a3')).toBe('other-legal')
    expect(classifyLessonMove(rook, 'a1', 'b2')).toBe('illegal')
    expect(classifyLessonMove(rook, 'e1', 'e2')).toBe('wrong-piece')
  })

  it('validates bishop diagonals and rejects a straight bishop move', () => {
    const bishop = lessons.find((lesson) => lesson.id === 'bishop-first-move')!
    expect(classifyLessonMove(bishop, 'c1', 'e3')).toBe('other-legal')
    expect(classifyLessonMove(bishop, 'c1', 'c3')).toBe('illegal')
  })

  it('allows straight and diagonal queen alternatives but not a knight jump', () => {
    const queen = lessons.find((lesson) => lesson.id === 'queen-first-move')!
    expect(classifyLessonMove(queen, 'd1', 'd4')).toBe('other-legal')
    expect(classifyLessonMove(queen, 'd1', 'f3')).toBe('other-legal')
    expect(classifyLessonMove(queen, 'd1', 'f2')).toBe('illegal')
  })

  it('keeps the king one step away from attacked squares and the other king', () => {
    const king = lessons.find((lesson) => lesson.id === 'king-first-move')!
    expect(classifyLessonMove(king, 'e1', 'e3')).toBe('illegal')
    expect(classifyLessonMove({ ...king, startFen: '4kr2/p7/8/8/8/8/8/4K3 w - - 0 1' }, 'e1', 'f2')).toBe('illegal')
    expect(classifyLessonMove({ ...king, startFen: '8/p7/8/8/8/4k3/8/4K3 w - - 0 1' }, 'e1', 'f2')).toBe('illegal')
  })

  it('distinguishes pawn advances and captures and rejects illegal directions', () => {
    const pawn = lessons.find((lesson) => lesson.id === 'pawn-first-move')!
    expect(classifyLessonMove(pawn, 'e2', 'e3')).toBe('other-legal')
    expect(classifyLessonMove(pawn, 'e2', 'd3')).toBe('other-legal')
    expect(classifyLessonMove(pawn, 'e2', 'f3')).toBe('illegal')
    expect(classifyLessonMove(pawn, 'e2', 'e1')).toBe('illegal')
    expect(classifyLessonMove(pawn, 'e2', 'e5')).toBe('illegal')
    expect(classifyLessonMove({ ...pawn, startFen: '4k3/8/8/8/8/4p3/4P3/4K3 w - - 0 1' }, 'e2', 'e4')).toBe('illegal')
  })
})
