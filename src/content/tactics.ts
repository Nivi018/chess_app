import type { Square } from 'chess.js'

export type TacticStep = {
  actor: 'learner' | 'prepared-reply'
  from: Square
  to: Square
}

export type TacticDefinition = {
  id: string
  title: string
  theme: string
  startFen: string
  instruction: string
  hint: string
  explanation: string
  steps: TacticStep[]
}

export const tactics: TacticDefinition[] = [
  {
    id: 'tactic-knight-fork-v1',
    title: 'La horquilla del caballo',
    theme: 'Ataque doble',
    startFen: '6r1/7k/8/3N4/8/8/8/K7 w - - 0 1',
    instruction: 'Encuentra el salto del caballo que da jaque y ataca a la vez la torre negra.',
    hint: 'El caballo puede dar jaque desde f6. Desde allí también ataca la torre de g8.',
    explanation: 'El caballo dio jaque desde f6 y atacó simultáneamente al rey de h7 y a la torre de g8. El rey respondió con la jugada preparada a h6; entonces el caballo capturó la torre. Atacar dos objetivos a la vez se llama horquilla o ataque doble.',
    steps: [
      { actor: 'learner', from: 'd5', to: 'f6' },
      { actor: 'prepared-reply', from: 'h7', to: 'h6' },
      { actor: 'learner', from: 'f6', to: 'g8' },
    ],
  },
  {
    id: 'tactic-queen-mate-v1',
    title: 'La dama apunta a f7',
    theme: 'Coordinación y mate',
    startFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3',
    instruction: 'Prepara el ataque sobre f7 con la dama. Después de una respuesta rival preparada, busca el jaque mate.',
    hint: 'La dama puede llegar a h5 y presionar f7 por la diagonal. El alfil de c4 también apunta a esa casilla.',
    explanation: 'La dama llegó a h5 y amenazó f7, coordinada con el alfil de c4. El ejercicio muestra una respuesta rival preparada, Cf6; no es una partida contra IA ni afirma que sea la única defensa. Entonces Dxf7 es jaque mate: dama y alfil se apoyan y el rey negro no tiene salida.',
    steps: [
      { actor: 'learner', from: 'd1', to: 'h5' },
      { actor: 'prepared-reply', from: 'g8', to: 'f6' },
      { actor: 'learner', from: 'h5', to: 'f7' },
    ],
  },
]
