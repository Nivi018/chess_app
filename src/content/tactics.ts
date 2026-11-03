import type { Square } from 'chess.js'

type TacticMove = {
  from: Square
  to: Square
}

export type TacticStep = TacticMove & (
  | { actor: 'learner'; instruction: string; hint: string }
  | { actor: 'prepared-reply'; explanation: string }
)

export type TacticDefinition = {
  id: string
  title: string
  theme: string
  startFen: string
  instruction: string
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
    explanation: 'El caballo dio jaque desde f6 y atacó simultáneamente al rey de h7 y a la torre de g8. El rey respondió con la jugada preparada a h6; entonces el caballo capturó la torre. Atacar dos objetivos a la vez se llama horquilla o ataque doble.',
    steps: [
      { actor: 'learner', from: 'd5', to: 'f6', instruction: 'Encuentra el salto que da jaque y ataca a la vez la torre negra.', hint: 'Salta de d5 a f6: desde allí el caballo ataca h7 y g8.' },
      { actor: 'prepared-reply', from: 'h7', to: 'h6', explanation: 'El rey se apartó del jaque. Esta es la respuesta preparada para practicar la continuación, no la única defensa posible.' },
      { actor: 'learner', from: 'f6', to: 'g8', instruction: 'El rey ya respondió. Aprovecha el ataque doble para capturar la torre con el caballo.', hint: 'Desde f6, el caballo puede saltar a g8 y capturar la torre.' },
    ],
  },
  {
    id: 'tactic-queen-mate-v1',
    title: 'La dama apunta a f7',
    theme: 'Coordinación y mate',
    startFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3',
    instruction: 'Prepara el ataque sobre f7 con la dama. Después de una respuesta rival preparada, busca el jaque mate.',
    explanation: 'La dama llegó a h5 y amenazó f7, coordinada con el alfil de c4. El ejercicio muestra una respuesta rival preparada, Cf6; no es una partida contra IA ni afirma que sea la única defensa. Entonces Dxf7 es jaque mate: dama y alfil se apoyan y el rey negro no tiene salida.',
    steps: [
      { actor: 'learner', from: 'd1', to: 'h5', instruction: 'Lleva la dama a una casilla desde la que apunte a f7 junto al alfil de c4.', hint: 'La diagonal d1–e2–f3–g4–h5 está libre. En h5, la dama apunta a f7.' },
      { actor: 'prepared-reply', from: 'g8', to: 'f6', explanation: 'Las negras desarrollaron el caballo sin detener la amenaza. Hay otras defensas; esta respuesta ilustra el error que vamos a aprovechar.' },
      { actor: 'learner', from: 'h5', to: 'f7', instruction: 'Aprovecha la respuesta preparada: encuentra el jaque mate con la dama, apoyada por el alfil.', hint: 'Captura el peón de f7 con la dama de h5. El alfil de c4 protege la casilla f7.' },
    ],
  },
  {
    id: 'tactic-bishop-pin-v1',
    title: 'El caballo queda clavado',
    theme: 'Clavada',
    startFen: '8/p7/4k3/3n4/4P3/8/8/5BK1 w - - 0 1',
    instruction: 'Coloca el alfil para alinear al caballo negro con su rey y después captura el caballo.',
    explanation: 'El alfil llegó a c4 y clavó al caballo de d5 contra el rey de e6: el caballo no podía moverse porque descubriría un jaque. Tras la respuesta preparada a6, Axd5 capturó el caballo. El peón de e4 protege d5, así que el rey negro no puede capturar al alfil allí. La línea es una práctica guiada, no una afirmación de defensa óptima.',
    steps: [
      { actor: 'learner', from: 'f1', to: 'c4', instruction: 'Desde f1, coloca el alfil en c4 para alinear caballo y rey en una misma diagonal.', hint: 'Recorre f1–e2–d3–c4. Desde c4, la diagonal continúa por d5 hasta e6.' },
      { actor: 'prepared-reply', from: 'a7', to: 'a6', explanation: 'Las negras movieron su peón y mantuvieron la clavada. Es una respuesta preparada; no se afirma que sea la mejor defensa.' },
      { actor: 'learner', from: 'c4', to: 'd5', instruction: 'Captura el caballo clavado con el alfil, en una casilla que tu peón protege.', hint: 'Juega de c4 a d5. El peón blanco de e4 protege al alfil en d5.' },
    ],
  },
  {
    id: 'tactic-rook-ladder-v1',
    title: 'Las torres forman una escalera',
    theme: 'Mate sencillo',
    startFen: '6k1/8/8/8/8/8/1R6/R5K1 w - - 0 1',
    instruction: 'Coordina las dos torres: corta una fila y da mate con la otra después de la respuesta preparada.',
    explanation: 'La torre de a7 corta toda la fila 7. Tras la respuesta preparada Rh8 del rey negro, la otra torre llega a b8 y da jaque por la fila 8. El rey negro no puede bajar a la fila 7 ni escapar del jaque: es mate en escalera. La primera respuesta es editorial, no una defensa forzada.',
    steps: [
      { actor: 'learner', from: 'a1', to: 'a7', instruction: 'Usa la torre de a1 para cortar la fila 7 y reducir el espacio del rey negro.', hint: 'La columna a está libre: lleva esa torre de a1 a a7.' },
      { actor: 'prepared-reply', from: 'g8', to: 'h8', explanation: 'El rey negro se desplazó a h8. Observa que la torre de a7 ya le impide bajar a la fila 7.' },
      { actor: 'learner', from: 'b2', to: 'b8', instruction: 'Con la otra torre, da jaque por la fila 8 sin dejar al rey una salida.', hint: 'Sube la torre de b2 a b8. La torre de a7 sigue controlando g7 y h7.' },
    ],
  },
  {
    id: 'tactic-discovered-attack-v1',
    title: 'Despeja el ataque de la torre',
    theme: 'Ataque descubierto',
    startFen: '4k3/8/q7/8/8/8/4B3/4R1K1 w - - 0 1',
    instruction: 'Mueve el alfil para descubrir un jaque de la torre y atacar la dama en la misma jugada.',
    explanation: 'Al moverse de e2 a b5, el alfil abrió la columna e: la torre de e1 dio jaque al rey de e8. Al mismo tiempo, el alfil atacó a la dama de a6. Tras la respuesta preparada Rf8 del rey negro, Axa6 capturó la dama. El jaque apareció al retirar una pieza que tapaba la línea: un ataque descubierto.',
    steps: [
      { actor: 'learner', from: 'e2', to: 'b5', instruction: 'Lleva el alfil de e2 a b5: abre la columna de la torre y apunta a la dama de a6.', hint: 'Sigue e2–d3–c4–b5. Al salir de la columna e, el alfil deja que la torre dé jaque.' },
      { actor: 'prepared-reply', from: 'e8', to: 'f8', explanation: 'El rey salió del jaque de la torre. Ahora puedes aprovechar el ataque que el alfil ya creó contra la dama.' },
      { actor: 'learner', from: 'b5', to: 'a6', instruction: 'Completa la idea capturando la dama con el alfil.', hint: 'La dama está en a6, una casilla en diagonal desde el alfil de b5.' },
    ],
  },
  {
    id: 'tactic-bishop-skewer-v1',
    title: 'La torre detrás del rey',
    theme: 'Enfilada',
    startFen: '5r2/p5k1/8/8/8/8/8/K1B5 w - - 0 1',
    instruction: 'Da jaque por la diagonal que coloca al rey negro delante de su torre y captura la torre después.',
    explanation: 'El alfil llegó a h6 y dio jaque al rey de g7; detrás de ese rey estaba la torre de f8. Tras la respuesta preparada Rh8 del rey negro, el alfil capturó la torre. Esta alineación se llama enfilada: primero atacas una pieza de mayor valor y, al apartarse, queda expuesta la que estaba detrás.',
    steps: [
      { actor: 'learner', from: 'c1', to: 'h6', instruction: 'Con el alfil, da jaque desde h6 para alinear al rey de g7 con la torre de f8.', hint: 'Sigue la diagonal c1–d2–e3–f4–g5–h6. Desde h6 miras hacia g7 y f8.' },
      { actor: 'prepared-reply', from: 'g7', to: 'h8', explanation: 'El rey se apartó a h8 y dejó libre la diagonal hacia la torre. Es la respuesta escogida para este ejercicio.' },
      { actor: 'learner', from: 'h6', to: 'f8', instruction: 'Captura la torre que quedó expuesta detrás del rey.', hint: 'Desde h6 pasa por g7, ahora vacía, y captura la torre de f8.' },
    ],
  },
]
