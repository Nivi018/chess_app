import type { LessonDefinition } from '../lesson-definition'

export const bishopLesson: LessonDefinition = {
  id: 'bishop-first-move',
  title: 'El alfil recorre las diagonales',
  summary: 'Descubre por qué un alfil siempre se queda en el mismo color.',
  coachTitle: 'En diagonal, sin saltar',
  pieceName: 'el alfil',
  startFen: '4k3/p7/8/8/8/8/8/2B1K3 w - - 0 1',
  targetFrom: 'c1',
  targetTo: 'f4',
  explanation: 'El alfil avanza en diagonal tantas casillas como quiera, sin saltar por encima de otras piezas. En cada paso cambia de fila y de columna a la vez. Por eso siempre pisa casillas del mismo color.',
  instruction: 'Mueve el alfil desde c1 hasta f4, siguiendo la diagonal hacia arriba y a la derecha.',
  hint: 'Sigue estas casillas de la misma diagonal: d2, e3 y f4.',
  feedback: {
    correct: '¡Bien hecho! El alfil llegó a f4 por la diagonal c1–d2–e3–f4. Todas esas casillas son del mismo color.',
    otherLegal: 'Esa diagonal también es legal. En este ejercicio, sigue la diagonal hacia arriba y a la derecha hasta f4.',
    illegal: 'El alfil no puede moverse así. Busca una diagonal libre, no una fila ni una columna.',
    wrongPiece: 'En este ejercicio, mueve el alfil que está en c1.',
  },
}
