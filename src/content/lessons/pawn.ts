import type { LessonDefinition } from '../lesson-definition'

export const pawnLesson: LessonDefinition = {
  id: 'pawn-first-move',
  title: 'El peón avanza y captura distinto',
  summary: 'Primero practica el avance inicial de un peón blanco.',
  coachTitle: 'Avanza recto, captura en diagonal',
  pieceName: 'el peón blanco',
  startFen: '4k3/8/8/8/8/3p4/4P3/4K3 w - - 0 1',
  targetFrom: 'e2',
  targetTo: 'e4',
  explanation: 'El peón avanza una casilla hacia delante si está libre. Desde su fila inicial puede avanzar dos, si ambas casillas están libres. Captura una pieza rival una casilla en diagonal hacia delante; no captura avanzando recto ni puede retroceder. Aquí las blancas avanzan hacia arriba.',
  instruction: 'Mueve el peón blanco desde e2 hasta e4: dos casillas hacia delante desde su fila inicial.',
  hint: 'e3 y e4 están libres. Mantente en la columna e para avanzar dos casillas; no hace falta capturar el peón negro.',
  feedback: {
    correct: '¡Lo lograste! Desde e2, su fila inicial, el peón pudo avanzar dos casillas hasta e4 porque e3 y e4 estaban libres.',
    otherLegal: 'Esa jugada es legal: puedes avanzar a e3 o capturar el peón negro en d3. Para practicar el avance inicial de dos casillas, elige e4.',
    illegal: 'Ese movimiento no es legal para el peón. No puede retroceder, avanzar tres casillas ni ir en diagonal sin capturar.',
    wrongPiece: 'En este ejercicio, mueve el peón blanco que está en e2.',
  },
}
