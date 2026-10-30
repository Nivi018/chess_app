# Academia de ajedrez — lecciones iniciales

Aplicación web responsive para principiantes con trece lecciones y trece ejercicios de repaso. Enseña los movimientos de las seis piezas, tres formas de responder al jaque, un primer jaque mate y las jugadas especiales. Incluye un tablero interactivo, feedback, pistas y progreso guardado localmente por actividad.

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

Añade un archivo de contenido en `src/content/lessons/` con una definición `LessonDefinition` (tipo en `src/content/lesson-definition.ts`) y regístrala en `src/content/lessons.ts`: identificador estable, posición FEN, origen y destino, textos, pista y feedback. Las promociones incluyen `targetPromotion` (`q`, `r`, `b` o `n`). Usa `positionNote` para explicar antecedentes relevantes, como la última jugada o los derechos de enroque de la posición inicial. No hace falta crear otra página ni duplicar hooks.

`useLesson` controla los intentos, validación, repetición y guardado; los componentes de `src/features/lesson/components` reciben el contenido de la definición. Las pruebas del catálogo verifican que cada posición y solución sea legal.

Las claves `chess-academy:<lessonId>:v1` conservan los progresos separados. La clave original del caballo no cambia. Al abrir la aplicación se ofrece la primera lección pendiente; si están todas completas se abre la primera para repasar.

Las primeras seis lecciones introducen los movimientos básicos. Las cuatro siguientes enseñan a salir del jaque moviendo el rey, bloqueando con un alfil o capturando al atacante, y a dar un mate con dama y rey. La explicación del mate distingue el mate del ahogado. Cada ejercicio pide una jugada concreta; otras defensas legales no se consideran ilegales, pero no completan ese objetivo guiado.

Las pruebas verifican que las tres defensas quitan el jaque y que la posición final del mate es realmente jaque mate, no solo jaque o ahogado. Todos los identificadores anteriores se conservan: diez lecciones completas ahora representan 10 de 13 y abren la primera lección especial pendiente.

## Jugadas especiales

Las lecciones 11–13 introducen el enroque corto, la promoción a dama y la captura al paso. Sus repasos practican el enroque largo, una promoción a caballo para dar jaque y otra captura al paso. El contenido está en `src/content/lessons/special-moves.ts` y `src/content/review-special-exercises.ts`.

- **Enroque:** mueve el rey hasta su destino; la torre se coloca automáticamente. Tras acertar se dibujan ambos recorridos. La validación comprueba derechos, camino libre y casillas del rey fuera de ataque. Volver al origen después de mover no recupera el derecho a enrocar.
- **Promoción:** tras seleccionar un destino legal, aparecen cuatro opciones dentro del panel: dama, torre, alfil y caballo. No hay elección automática ni intento registrado hasta confirmar una pieza. Cancelar no cuenta como intento. Una promoción legal distinta del objetivo recibe feedback y permite reintentar. El selector de destinos no repite una casilla por cada opción de promoción.
- **Captura al paso:** la nota de posición declara el avance rival de dos casillas inmediatamente anterior. El destino vacío y la retirada del peón contiguo se calculan con las reglas. Se prueban su caducidad y los casos donde la captura expondría al rey.

Los derechos de enroque y la oportunidad de captura al paso proceden de la FEN curada y su nota; no hay todavía una partida de varios turnos ni un historial interactivo. Al repetir se restaura la posición completa, incluidos esos derechos. La promoción pendiente se conserva al visitar **Mi avance** y volver, pero no al recargar; aún no representa un intento confirmado.

## Repasar movimientos

Desde la navegación, abre **Repasar movimientos** para resolver trece retos en posiciones nuevas: seis capturas, cuatro retos de jaque y mate y tres jugadas especiales. El catálogo está en `src/content/review-exercises.ts`, con los retos de jaque y especiales en archivos separados; se reutilizan el controlador, el tablero, las pistas y los wrappers de UI. La explicación y el recorrido solo se muestran después de acertar.

Los retos de jaque y jugadas especiales no indican la casilla de destino en el enunciado. Las pistas opcionales sí explican la jugada. Las pruebas verifican las defensas, el mate y los efectos especiales con las reglas de ajedrez, no solo con la casilla esperada.

Los diez repasos anteriores conservan sus identificadores y resultados. Si ya estaban resueltos, el avance pasa a 10 de 13 y se abre el primer reto especial pendiente, sin reiniciar los intentos, las pistas ni los primeros resultados.

El progreso de repaso tiene identificadores propios y no completa ni modifica las lecciones. El resumen muestra ejercicios resueltos, intentos acumulados, pistas consultadas y soluciones al primer intento sin ayuda. Se guarda cada consulta de pista, incluso antes de intentar una jugada; repetir no reemplaza el primer resultado. Los progresos antiguos sin estas métricas siguen siendo válidos y no reciben puntuaciones inventadas.

Al volver a entrar al repaso se abre el primer ejercicio pendiente, o el primero si todos están resueltos. La sección activa no se guarda: después de recargar se vuelve a las lecciones. Este repaso es práctica guiada, no una evaluación de ELO ni una prueba de dominio definitivo.

## Mi avance

**Mi avance** abre un panel conjunto de las trece lecciones y los trece repasos. Muestra completitud por separado, pendientes, intentos y pistas por actividad, y el primer resultado de los repasos. Si un registro antiguo no incluye ese resultado, se indica que no está registrado en lugar de inferirlo.

El siguiente paso sigue una regla sencilla y visible: primera lección pendiente, después primer repaso pendiente y, cuando todo está completado, un repaso cuyo primer resultado tuvo ayuda o error. Si no hay ninguno, ofrece repetir el primer repaso. No estima dominio ni ELO, no programa repaso espaciado y no modifica el primer resultado al repetir; por eso la sugerencia histórica puede mantenerse tras practicarlo de nuevo.

Desde el panel puedes abrir cualquier actividad o repetir una completada directamente desde su posición inicial. **Volver a la actividad** conserva el estado de la actividad abierta, incluidas las pistas visibles. Los resultados se actualizan durante la sesión. Si falla el guardado, se mantienen en memoria al navegar y el panel advierte que podrían perderse al recargar. No hay sincronización entre dispositivos ni actualización en directo entre pestañas.
