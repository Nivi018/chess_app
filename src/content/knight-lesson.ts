export const knightLesson = {
  title: 'El caballo salta en forma de L',
  summary: 'Aprende una regla y compruébala moviendo una pieza.',
  explanation:
    'El caballo avanza dos casillas en una dirección y una más hacia un lado. Puede saltar por encima de otras piezas.',
  instruction:
    'Desde b1, busca la casilla que queda dos filas hacia delante y una columna a la derecha.',
  hint: 'Cuenta dos filas hacia arriba desde b1; después, avanza una columna a la derecha.',
  targetFrom: 'b1',
  targetTo: 'c3',
  feedback: {
    correct:
      '¡Lo encontraste! El caballo avanzó dos casillas y una hacia un lado. Ese es su salto en forma de L.',
    otherLegal:
      'Ese salto también es legal. Para este ejemplo, busca dos filas hacia delante y una columna a la derecha.',
    illegal: 'Ese movimiento no es legal para el caballo. Recuerda: dos casillas y luego una hacia un lado.',
    wrongPiece: 'En este ejercicio, mueve el caballo que está en b1.',
  },
} as const
