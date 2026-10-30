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

- React, TypeScript, Vite y Tailwind CSS 4.
- PrimeReact 10.9.9 (MIT) se integra a través de wrappers en `src/components/ui`; las features no importan PrimeReact directamente.
- `App.tsx` solo compone la página. La vista y el estado de la lección están separados en `src/features/lesson`.
- `react-chessboard` y `chess.js` gestionan la representación y las reglas del ajedrez, respectivamente.
- El progreso se guarda en `localStorage`; no se crean cuentas ni se envían datos a un servidor.
- No se necesita Stockfish para esta lección.
- El plan maestro dividido está en [`docs/plan-maestro/README.md`](docs/plan-maestro/README.md).
