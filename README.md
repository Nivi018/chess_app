# Academia de ajedrez — lecciones iniciales

Aplicación web responsive para principiantes con dos lecciones: movimiento del caballo y movimiento de la torre. Incluye un tablero interactivo, feedback, pistas y progreso guardado localmente por lección.

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

## Agregar una lección

Añade una definición `LessonDefinition` en `src/content/lessons.ts`: identificador estable, posición FEN, origen y destino, textos, pista y feedback. No hace falta crear otra página ni duplicar hooks.

`useLesson` controla los intentos, validación, repetición y guardado; los componentes de `src/features/lesson/components` reciben el contenido de la definición. Las pruebas del catálogo verifican que cada posición y solución sea legal.

Las claves `chess-academy:<lessonId>:v1` conservan los progresos separados. La clave original del caballo no cambia. Al abrir la aplicación se ofrece la primera lección pendiente; si están todas completas se abre la primera para repasar.
