import type { LessonDefinition } from '../lesson-definition'

export const checkEscapeLesson: LessonDefinition = {
  id: 'check-escape-first-move',
  title: 'Sal del jaque con el rey',
  summary: 'Reconoce un ataque al rey y busca una casilla segura.',
  coachTitle: 'El jaque exige una respuesta',
  pieceName: 'el rey blanco',
  startFen: 'k3r3/p7/8/8/8/8/8/4K3 w - - 0 1',
  targetFrom: 'e1',
  targetTo: 'f1',
  explanation: 'Hay jaque cuando una pieza rival ataca a tu rey. Debes quitar ese ataque en tu siguiente jugada: no puedes ignorarlo. Aquí la torre negra de e8 ataca al rey por la columna e. Una forma de responder es mover el rey a una casilla que no esté atacada.',
  instruction: 'Saca al rey de la columna atacada: muévelo de e1 a f1, una casilla a la derecha.',
  hint: 'La torre ataca toda la columna e. f1 queda fuera de esa columna y ninguna pieza negra la ataca.',
  feedback: {
    correct: '¡Bien! El rey llegó a f1, fuera del ataque de la torre. Las blancas ya no están en jaque.',
    otherLegal: 'Esa casilla también permite salir del jaque. Para este ejercicio, elige f1.',
    illegal: 'Ese movimiento no es legal. El rey debe dar un solo paso y terminar fuera de cualquier ataque; e2 sigue en la columna de la torre.',
    wrongPiece: 'En este ejercicio, mueve el rey blanco que está en e1.',
  },
}
