import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { lessons } from '../lessons'
import { checkEscapeLesson } from './check-escape'
import { checkBlockLesson } from './check-block'
import { checkCaptureLesson } from './check-capture'
import { checkmateLesson } from './checkmate'
import { classifyLessonMove } from '../../domain/lesson'

describe('check and checkmate lessons', () => {
  it('appends four lessons without replacing the six original activities', () => {
    expect(lessons).toHaveLength(10)
    expect(lessons.slice(0, 6).map((lesson) => lesson.id)).toEqual([
      'knight-first-move', 'rook-first-move', 'bishop-first-move',
      'queen-first-move', 'king-first-move', 'pawn-first-move',
    ])
    expect(lessons.slice(6)).toEqual([checkEscapeLesson, checkBlockLesson, checkCaptureLesson, checkmateLesson])
  })

  for (const lesson of [checkEscapeLesson, checkBlockLesson, checkCaptureLesson]) {
    it(`starts in check and removes the attack in ${lesson.id}`, () => {
      const game = new Chess(lesson.startFen)
      expect(game.isCheck()).toBe(true)
      game.move({ from: lesson.targetFrom, to: lesson.targetTo })
      // Inspect the white king again: after a move, isCheck() concerns Black.
      const whiteToMove = new Chess(game.fen().replace(' b ', ' w '))
      expect(whiteToMove.isCheck()).toBe(false)
      expect(game.isGameOver()).toBe(false)
    })
  }

  it('rejects a king step that remains on the attacked file', () => {
    expect(classifyLessonMove(checkEscapeLesson, 'e1', 'e2')).toBe('illegal')
    expect(classifyLessonMove(checkEscapeLesson, 'e1', 'd1')).toBe('other-legal')
  })

  it('rejects a bishop diagonal that does not block the check', () => {
    expect(classifyLessonMove(checkBlockLesson, 'c1', 'b2')).toBe('illegal')
    const game = new Chess(checkBlockLesson.startFen)
    game.move({ from: 'c1', to: 'e3' })
    expect(game.get('e8')?.type).toBe('r')
    expect(game.get('e1')?.type).toBe('k')
  })

  it('actually captures the checking rook and rejects ignoring it', () => {
    const game = new Chess(checkCaptureLesson.startFen)
    expect(game.move({ from: 'b5', to: 'e2' }).captured).toBe('r')
    expect(classifyLessonMove(checkCaptureLesson, 'b5', 'c4')).toBe('illegal')
  })

  it('ends with verified checkmate, not merely check or stalemate', () => {
    const game = new Chess(checkmateLesson.startFen)
    expect(game.isCheck()).toBe(false)
    expect(game.isGameOver()).toBe(false)
    game.move({ from: 'g6', to: 'g7' })
    expect(game.isCheck()).toBe(true)
    expect(game.isCheckmate()).toBe(true)
    expect(game.isStalemate()).toBe(false)
    expect(game.moves()).toHaveLength(0)
    expect(game.get('h8')?.type).toBe('k')
  })

  it('does not credit a different legal check or a stalemate as the solution', () => {
    const check = new Chess(checkmateLesson.startFen)
    check.move({ from: 'g6', to: 'h6' })
    expect(check.isCheck()).toBe(true)
    expect(check.isCheckmate()).toBe(false)
    expect(classifyLessonMove(checkmateLesson, 'g6', 'h6')).toBe('other-legal')
    const stalemate = new Chess(checkmateLesson.startFen)
    stalemate.move({ from: 'g6', to: 'f7' })
    expect(stalemate.isStalemate()).toBe(true)
    expect(classifyLessonMove(checkmateLesson, 'g6', 'f7')).toBe('other-legal')
  })
})
