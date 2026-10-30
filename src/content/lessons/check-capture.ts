import type { LessonDefinition } from '../lesson-definition'

export const checkCaptureLesson: LessonDefinition = {
  id: 'check-capture-first-move',
  title: 'Captura la pieza que da jaque',
  summary: 'Elimina el ataque sin mover a tu rey.',
  coachTitle: 'Otra defensa: capturar al atacante',
  pieceName: 'el alfil blanco',
  startFen: 'k7/p7/8/1B6/8/8/4r3/4K3 w - - 0 1',
  targetFrom: 'b5',
  targetTo: 'e2',
  explanation: 'Otra forma de salir del jaque es capturar la pieza que ataca al rey, siempre que no quede otro ataque sobre él. Capturar significa ocupar la casilla de una pieza rival y retirarla. La torre negra de e2 da jaque al rey de e1; el alfil de b5 puede capturar esa torre por la diagonal.',
  instruction: 'Quita el jaque capturando la torre de e2 con el alfil blanco de b5.',
  hint: 'Desde b5, sigue la diagonal hacia abajo y a la derecha: c4, d3 y e2.',
  feedback: {
    correct: '¡Muy bien! El alfil capturó la torre en e2. Al desaparecer la pieza atacante, el rey dejó de estar en jaque.',
    otherLegal: 'Esa jugada es legal, pero aquí practicamos capturar la torre de e2 con el alfil.',
    illegal: 'Ese movimiento no es legal. El alfil debe seguir una diagonal y la jugada tiene que dejar al rey fuera de jaque.',
    wrongPiece: 'Usa el alfil de b5 para capturar la torre; el objetivo es defender al rey con otra pieza.',
  },
}
