# Academia de ajedrez — lecciones iniciales

Aplicación web responsive para principiantes con seis lecciones y seis ejercicios de repaso: caballo, torre, alfil, dama, rey y peón. Incluye un tablero interactivo, feedback, pistas y progreso guardado localmente por actividad.

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
- No se necesita Stockfish para estas lecciones.
- El plan maestro dividido está en [`docs/plan-maestro/README.md`](docs/plan-maestro/README.md).

## Agregar una lección

Añade un archivo de contenido en `src/content/lessons/` con una definición `LessonDefinition` (tipo en `src/content/lesson-definition.ts`) y regístrala en `src/content/lessons.ts`: identificador estable, posición FEN, origen y destino, textos, pista y feedback. No hace falta crear otra página ni duplicar hooks.

`useLesson` controla los intentos, validación, repetición y guardado; los componentes de `src/features/lesson/components` reciben el contenido de la definición. Las pruebas del catálogo verifican que cada posición y solución sea legal.

Las claves `chess-academy:<lessonId>:v1` conservan los progresos separados. La clave original del caballo no cambia. Al abrir la aplicación se ofrece la primera lección pendiente; si están todas completas se abre la primera para repasar.

Estas lecciones introducen los movimientos básicos. La captura al paso, promoción y enroque requieren lecciones posteriores; el ejercicio inicial del peón se centra en su avance inicial.

## Repasar movimientos

Desde la navegación, abre **Repasar movimientos** para resolver seis capturas en posiciones nuevas. Los datos están en `src/content/review-exercises.ts`; se reutilizan el controlador, el tablero, las pistas y los wrappers de UI. La explicación y el recorrido solo se muestran después de acertar.

El progreso de repaso tiene identificadores propios y no completa ni modifica las lecciones. El resumen muestra ejercicios resueltos, intentos acumulados, pistas consultadas y soluciones al primer intento sin ayuda. Se guarda cada consulta de pista, incluso antes de intentar una jugada; repetir no reemplaza el primer resultado. Los progresos antiguos sin estas métricas siguen siendo válidos y no reciben puntuaciones inventadas.

Al volver a entrar al repaso se abre el primer ejercicio pendiente, o el primero si todos están resueltos. La sección activa no se guarda: después de recargar se vuelve a las lecciones. Este repaso es práctica guiada, no una evaluación de ELO ni una prueba de dominio definitivo.
