# Academia de ajedrez — primera lección

Aplicación web responsive para enseñar a una persona principiante cómo se mueve el caballo. La primera entrega incluye un tablero interactivo, feedback para movimientos legales e ilegales, una pista opcional y progreso guardado localmente.

## Empezar

Requiere Node.js 22 o posterior.

```bash
npm install
npm run dev
```

Vite muestra la dirección local en la terminal.

## Comprobaciones

```bash
npm test
npm run build
```

## Alcance actual

- React, TypeScript, Vite, `react-chessboard` y `chess.js`.
- El progreso se guarda en `localStorage`; no se crean cuentas ni se envían datos a un servidor.
- No se necesita Stockfish para esta lección.
- El plan maestro dividido está en [`docs/plan-maestro/README.md`](docs/plan-maestro/README.md).
