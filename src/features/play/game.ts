import { Chess } from 'chess.js'

export function replayGame(moves: string[]) {
  const game = new Chess()
  moves.forEach((move) => game.move(move))
  return game
}

export function gameResult(game: Chess): string | null {
  if (game.isCheckmate()) return game.turn() === 'w' ? 'Jaque mate. Ganan las negras.' : 'Jaque mate. Ganan las blancas.'
  if (game.isStalemate()) return 'Tablas por ahogado: no hay jugadas legales y el rey no está en jaque.'
  if (game.isThreefoldRepetition()) return 'Tablas por repetición de la posición.'
  if (game.isInsufficientMaterial()) return 'Tablas por material insuficiente.'
  if (game.isDrawByFiftyMoves()) return 'Tablas por la regla de las cincuenta jugadas.'
  if (game.isDraw()) return 'La partida termina en tablas.'
  return null
}
