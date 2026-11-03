import { Chess, type Square } from 'chess.js'
import type { TacticDefinition, TacticStep } from '../content/tactics'
import type { MoveOutcome } from './lesson'

export function replayTactic(tactic: TacticDefinition, plies = tactic.steps.length) {
  const game = new Chess(tactic.startFen)
  const moves: string[] = []
  for (const step of tactic.steps.slice(0, plies)) {
    const move = game.move({ from: step.from, to: step.to })
    moves.push(move.san)
  }
  return { position: game.fen(), moves, game }
}

export function validateTactic(tactic: TacticDefinition): boolean {
  try {
    const game = new Chess(tactic.startFen)
    let expectedActor: TacticStep['actor'] = 'learner'
    for (const step of tactic.steps) {
      if (step.actor !== expectedActor) return false
      game.move({ from: step.from, to: step.to })
      expectedActor = step.actor === 'learner' ? 'prepared-reply' : 'learner'
    }
    return tactic.steps.at(-1)?.actor === 'learner'
  } catch {
    return false
  }
}

export function classifyTacticMove(
  position: string,
  expected: TacticStep,
  from: string,
  to: string,
): MoveOutcome {
  if (from !== expected.from) return 'wrong-piece'
  try {
    new Chess(position).move({ from, to })
    return to === expected.to ? 'correct' : 'other-legal'
  } catch {
    return 'illegal'
  }
}

export function legalTacticDestinations(position: string, from: Square) {
  return new Chess(position).moves({ square: from, verbose: true }).map((move) => ({ label: move.to, value: move.to }))
}
