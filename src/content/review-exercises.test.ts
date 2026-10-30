import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { lessons } from './lessons'
import { reviewExercises } from './review-exercises'
import { classifyLessonMove } from '../domain/lesson'

describe('review exercise catalog', () => {
  it('uses independent IDs and new positions for all thirteen reviews', () => {
    expect(reviewExercises).toHaveLength(13)
    expect(new Set(reviewExercises.map((item) => item.id)).size).toBe(reviewExercises.length)
    expect(new Set(reviewExercises.map((item) => item.startFen)).size).toBe(reviewExercises.length)
    expect(reviewExercises.slice(0, 6).map((item) => new Chess(item.startFen).get(item.targetFrom)?.type)).toEqual(['n', 'r', 'b', 'q', 'k', 'p'])
    for (const exercise of reviewExercises) {
      expect(lessons.some((lesson) => lesson.id === exercise.id || lesson.startFen === exercise.startFen)).toBe(false)
    }
  })

  for (const exercise of reviewExercises) {
    it(`validates the solution in ${exercise.id}`, () => {
      const game = new Chess(exercise.startFen)
      expect(game.isGameOver()).toBe(false)
      expect(classifyLessonMove(exercise, exercise.targetFrom, exercise.targetTo, exercise.targetPromotion)).toBe('correct')
      expect(() => game.move({ from: exercise.targetFrom, to: exercise.targetTo, promotion: exercise.targetPromotion })).not.toThrow()
    })
  }

  for (const exercise of reviewExercises.slice(0, 6)) {
    it(`retains the original pawn capture in ${exercise.id}`, () => {
      const game = new Chess(exercise.startFen)
      expect(game.get(exercise.targetTo)?.color).toBe('b')
      expect(game.move({ from: exercise.targetFrom, to: exercise.targetTo }).captured).toBe('p')
    })
  }
})
