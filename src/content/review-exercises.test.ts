import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { lessons } from './lessons'
import { reviewExercises } from './review-exercises'
import { classifyLessonMove } from '../domain/lesson'

describe('review exercise catalog', () => {
  it('uses independent IDs and new positions for the six pieces', () => {
    expect(new Set(reviewExercises.map((item) => item.id)).size).toBe(6)
    expect(reviewExercises.map((item) => new Chess(item.startFen).get(item.targetFrom)?.type)).toEqual(['n', 'r', 'b', 'q', 'k', 'p'])
    for (const exercise of reviewExercises) {
      expect(lessons.some((lesson) => lesson.id === exercise.id || lesson.startFen === exercise.startFen)).toBe(false)
    }
  })

  for (const exercise of reviewExercises) {
    it(`validates the capture in ${exercise.id}`, () => {
      const game = new Chess(exercise.startFen)
      expect(game.get(exercise.targetTo)?.color).toBe('b')
      expect(classifyLessonMove(exercise, exercise.targetFrom, exercise.targetTo)).toBe('correct')
      expect(game.move({ from: exercise.targetFrom, to: exercise.targetTo }).captured).toBe('p')
    })
  }
})
