import type { LessonDefinition } from '../lesson-definition'

export const kingLesson: LessonDefinition = {
  id: 'king-first-move',
  title: 'El rey avanza una casilla',
  summary: 'Un paso en cualquier dirección, siempre que la casilla sea segura.',
  coachTitle: 'Un paso y con cuidado',
  pieceName: 'el rey',
  startFen: '4k3/p7/8/8/8/8/8/4K3 w - - 0 1',
  targetFrom: 'e1',
  targetTo: 'f2',
  explanation: 'El rey puede moverse una casilla en cualquier dirección, también en diagonal. Nunca puede entrar en una casilla atacada por el rival ni quedar junto al otro rey. Más adelante aprenderás una jugada especial llamada enroque.',
  instruction: 'Mueve el rey blanco desde e1 hasta f2: un paso en diagonal hacia arriba y a la derecha.',
  hint: 'Busca f2 justo en diagonal junto a e1. No necesitas alejarte dos casillas.',
  feedback: {
    correct: '¡Muy bien! El rey avanzó una sola casilla en diagonal hasta f2, una casilla segura en esta posición.',
    otherLegal: 'Ese paso es legal y seguro. En este ejercicio, busca f2, en diagonal junto a e1.',
    illegal: 'Ese movimiento no es legal para el rey. Debe avanzar una sola casilla y no puede ponerse bajo ataque.',
    wrongPiece: 'En este ejercicio, mueve el rey blanco que está en e1.',
  },
}
