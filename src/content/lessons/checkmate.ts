import type { LessonDefinition } from '../lesson-definition'

export const checkmateLesson: LessonDefinition = {
  id: 'checkmate-first-move',
  title: 'Tu primer jaque mate',
  summary: 'Da jaque sin dejar al rival una defensa legal.',
  coachTitle: 'Jaque y ninguna salida',
  pieceName: 'la dama blanca',
  startFen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1',
  targetFrom: 'g6',
  targetTo: 'g7',
  explanation: 'Es jaque mate cuando el rey está atacado y ninguna jugada legal puede quitar el jaque: no puede escapar, bloquear ni capturar al atacante. La partida termina y gana quien da mate; el rey no se captura. Aquí la dama y el rey blancos trabajan juntos. Si un jugador no tiene jugadas legales pero su rey NO está en jaque, es ahogado y la partida acaba en tablas (empate), no en victoria.',
  instruction: 'Da jaque mate al rey negro de h8: mueve la dama blanca de g6 a g7, protegida por tu rey de f6.',
  hint: 'En g7, la dama ataca h8 y cubre las salidas g8 y h7. El rey blanco protege g7, así que el rey negro no puede capturarla.',
  feedback: {
    correct: '¡Jaque mate! La dama de g7 ataca h8 y cubre g8 y h7. El rey de f6 protege a la dama: el rey negro no puede capturarla y no tiene ninguna defensa legal.',
    otherLegal: 'Esa jugada es legal, pero no es la solución pedida. Busca g7: allí la dama da jaque, controla las salidas y está protegida por tu rey.',
    illegal: 'Ese movimiento no es legal. La dama debe seguir una fila, columna o diagonal libre y no puede ocupar la casilla del rey negro: los reyes no se capturan.',
    wrongPiece: 'En este ejercicio, mueve la dama blanca que está en g6.',
  },
}
