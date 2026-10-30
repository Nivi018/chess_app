import type { LessonDefinition } from '../lesson-definition'

export const checkBlockLesson: LessonDefinition = {
  id: 'check-block-first-move',
  title: 'Bloquea un jaque',
  summary: 'Protege al rey colocando una pieza entre él y el ataque.',
  coachTitle: 'Interrumpe la línea de ataque',
  pieceName: 'el alfil blanco',
  startFen: 'k3r3/p7/8/8/8/8/8/2B1K3 w - - 0 1',
  targetFrom: 'c1',
  targetTo: 'e3',
  explanation: 'No siempre hace falta mover al rey para salir del jaque. Si una torre, alfil o dama ataca desde lejos, a veces puedes poner una pieza en medio. Aquí el alfil puede cortar la columna entre la torre de e8 y el rey de e1. Un jaque de caballo no se puede bloquear: el caballo salta.',
  instruction: 'Bloquea el ataque de la torre: mueve el alfil de c1 a e3, entre la torre negra y tu rey.',
  hint: 'Sigue la diagonal c1–d2–e3. En e3 el alfil corta la columna e antes de que el ataque llegue al rey.',
  feedback: {
    correct: '¡Correcto! El alfil de e3 bloquea a la torre. El rey permanece en e1, pero ya no está en jaque.',
    otherLegal: 'Ese movimiento es legal, pero practica el bloqueo llevando el alfil a e3.',
    illegal: 'Ese movimiento no es legal en esta posición. Además de seguir una diagonal, el alfil debe quitar el jaque; si no corta el ataque, el rey sigue en peligro.',
    wrongPiece: 'Practica el bloqueo con el alfil blanco de c1, sin mover el rey.',
  },
}
