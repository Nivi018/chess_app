import type { LessonDefinition } from '../lesson-definition'

export const queenLesson: LessonDefinition = {
  id: 'queen-first-move',
  title: 'La dama combina rectas y diagonales',
  summary: 'Una pieza que reúne los movimientos de la torre y del alfil.',
  coachTitle: 'Tres tipos de líneas',
  pieceName: 'la dama',
  startFen: '4k3/8/8/8/8/8/8/3QK3 w - - 0 1',
  targetFrom: 'd1',
  targetTo: 'g4',
  explanation: 'La dama puede moverse por filas, columnas o diagonales, tantas casillas como quiera. Como la torre y el alfil, no puede saltar por encima de otras piezas ni cambiar de dirección en una misma jugada.',
  instruction: 'Practica su movimiento diagonal: lleva la dama desde d1 hasta g4.',
  hint: 'Desde d1, sube por la diagonal hacia la derecha: e2, f3 y g4.',
  feedback: {
    correct: '¡Correcto! La dama siguió la diagonal hasta g4, igual que un alfil. También puede desplazarse por filas y columnas, como una torre.',
    otherLegal: 'Ese movimiento también es legal para la dama. Ahora practica la diagonal que conecta d1 con g4.',
    illegal: 'La dama necesita una fila, columna o diagonal libre. No puede saltar ni moverse en forma de L.',
    wrongPiece: 'En este ejercicio, mueve la dama que está en d1.',
  },
}
