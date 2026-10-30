import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { lessons } from './lessons'
import { classifyLessonMove } from '../domain/lesson'

describe('published lesson catalog', () => {
  it('has unique, stable lesson IDs', () => {
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(lessons.length)
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
})
