import { knightLesson } from './knight-lesson'
import { LESSON_START_FEN } from '../domain/lesson'
import type { LessonDefinition } from './lesson-definition'
import { bishopLesson } from './lessons/bishop'
import { queenLesson } from './lessons/queen'
import { kingLesson } from './lessons/king'
import { pawnLesson } from './lessons/pawn'

export type { LessonDefinition } from './lesson-definition'

export const lessons: LessonDefinition[] = [
  {
    ...knightLesson,
    id: 'knight-first-move',
    coachTitle: 'Recuerda la forma de L',
    pieceName: 'el caballo',
    startFen: LESSON_START_FEN,
  },
  {
    id: 'rook-first-move',
    title: 'La torre se mueve en línea recta',
    summary: 'Practica otro movimiento en un tablero con pocas piezas.',
    coachTitle: 'Por filas o por columnas',
    pieceName: 'la torre',
    startFen: '4k3/8/8/8/8/8/8/R3K3 w Q - 0 1',
    targetFrom: 'a1',
    targetTo: 'a4',
    explanation: 'La torre puede avanzar tantas casillas como quiera en línea recta: arriba, abajo o hacia los lados. No puede saltar por encima de otras piezas.',
    instruction: 'Mueve la torre desde a1 hasta a4, tres casillas hacia arriba por la misma columna.',
    hint: 'Quédate en la columna a y cuenta las filas: a2, a3 y a4.',
    feedback: {
      correct: '¡Muy bien! La torre recorrió tres casillas por la columna a sin cambiar de dirección.',
      otherLegal: 'Ese movimiento es legal para la torre. En este ejercicio, busca a4 en la misma columna que a1.',
      illegal: 'La torre no puede moverse así. Busca una línea recta sin piezas en el camino.',
      wrongPiece: 'En este ejercicio, mueve la torre que está en a1.',
    },
  },
  bishopLesson,
  queenLesson,
  kingLesson,
  pawnLesson,
]
