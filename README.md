# Academia de ajedrez — lecciones iniciales

Aplicación web responsive para principiantes con trece lecciones, trece ejercicios de repaso y seis combinaciones tácticas de varias jugadas. Enseña los movimientos de las seis piezas, respuestas al jaque, jaque mate y jugadas especiales. Incluye un tablero interactivo, feedback, pistas y progreso guardado localmente por actividad.

## Empezar

Requiere Node.js 22.19 o posterior (los scripts usan los certificados del sistema).

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
- No se necesita Stockfish para las lecciones, los repasos ni las tácticas actuales.
- La sección independiente **Jugar contra el ordenador** usa Stockfish.js 19.0.1 en un Web Worker local, cargado solo al entrar.
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

En estas lecciones y repasos, los derechos de enroque y la oportunidad de captura al paso proceden de la FEN curada y su nota; son ejercicios de una jugada, no partidas completas. Al repetir se restaura la posición completa, incluidos esos derechos. La promoción pendiente se conserva al visitar **Mi avance** y volver, pero no al recargar; aún no representa un intento confirmado. La sección independiente contra el ordenador sí permite partidas completas e historial de jugadas.

## Repasar movimientos

Desde la navegación, abre **Repasar movimientos** para resolver trece retos en posiciones nuevas: seis capturas, cuatro retos de jaque y mate y tres jugadas especiales. El catálogo está en `src/content/review-exercises.ts`, con los retos de jaque y especiales en archivos separados; se reutilizan el controlador, el tablero, las pistas y los wrappers de UI. La explicación y el recorrido solo se muestran después de acertar.

Los retos de jaque y jugadas especiales no indican la casilla de destino en el enunciado. Las pistas opcionales sí explican la jugada. Las pruebas verifican las defensas, el mate y los efectos especiales con las reglas de ajedrez, no solo con la casilla esperada.

Los diez repasos anteriores conservan sus identificadores y resultados. Si ya estaban resueltos, el avance pasa a 10 de 13 y se abre el primer reto especial pendiente, sin reiniciar los intentos, las pistas ni los primeros resultados.

El progreso de repaso tiene identificadores propios y no completa ni modifica las lecciones. El resumen muestra ejercicios resueltos, intentos acumulados, pistas consultadas y soluciones al primer intento sin ayuda. Se guarda cada consulta de pista, incluso antes de intentar una jugada; repetir no reemplaza el primer resultado. Los progresos antiguos sin estas métricas siguen siendo válidos y no reciben puntuaciones inventadas.

Al volver a entrar al repaso se abre el primer ejercicio pendiente, o el primero si todos están resueltos. La sección activa no se guarda: después de recargar se vuelve a las lecciones. Este repaso es práctica guiada, no una evaluación de ELO ni una prueba de dominio definitivo.

## Mi avance

**Mi avance** abre un panel conjunto de las trece lecciones, los trece repasos y las seis tácticas. Muestra completitud por separado, pendientes, intentos y pistas por actividad, y los primeros resultados registrados. Si un registro antiguo no incluye ese resultado, se indica que no está registrado en lugar de inferirlo.

El siguiente paso sigue una regla sencilla y visible: primera lección pendiente, primer repaso pendiente, primera táctica pendiente y, cuando todo está completado, un repaso cuyo primer resultado tuvo ayuda o error. Si no hay ninguno, ofrece repetir el primer repaso. No estima dominio ni ELO, no programa repaso espaciado y no modifica el primer resultado al repetir; por eso la sugerencia histórica puede mantenerse tras practicarlo de nuevo.

Desde el panel puedes abrir cualquier actividad o repetir una completada directamente desde su posición inicial. **Volver a la actividad** conserva el estado de la actividad abierta, incluidas las pistas visibles. Los resultados se actualizan durante la sesión. Si falla el guardado, se mantienen en memoria al navegar y el panel advierte que podrían perderse al recargar. No hay sincronización entre dispositivos ni actualización en directo entre pestañas.

## Tácticas de varias jugadas

Abre **Practicar tácticas** para resolver una horquilla de caballo, un ataque de dama con mate, una clavada, un mate en escalera, un ataque descubierto y una enfilada. Cada línea tiene dos jugadas del estudiante y una respuesta rival preparada entre ellas. Tras acertar, la posición espera hasta pulsar **Ver respuesta rival**; mientras tanto se bloquean tablero, selector y pistas. La respuesta es editorial, no elegida por Stockfish ni necesariamente forzada. Cada paso del estudiante tiene su propia instrucción y pista; la pista se cierra al avanzar.

Las jugadas se validan con las reglas en la posición actual, no solo comparando coordenadas. Una alternativa legal no avanza la variante y no se califica como necesariamente mala en una partida. Los intentos cuentan por respuesta incorrecta o por combinación completa; observar la respuesta rival no cuenta. Las pistas y el primer resultado se guardan con IDs propios. Los dos IDs originales y todas las claves anteriores se conservan: dos tácticas resueltas pasan a representar 2 de 6. **Mi avance** recomienda tácticas después de lecciones y repasos. Volver del panel conserva la posición durante la sesión; recargar reinicia una línea incompleta sin perder las métricas guardadas.

## Carga por módulos

Lecciones, tácticas y **Mi avance** se cargan con `React.lazy`, con mensajes de espera y recuperación ante errores. El panel de avance no se descarga hasta abrirlo. La compilación genera `dist/.vite/manifest.json` para comprobar las dependencias.

Medición de esta iteración (JavaScript minificado, KB decimales): entrada ≈412 frente a ≈596 anteriores; primera lección completa, incluidas dependencias compartidas, ≈584. La reducción del archivo de entrada no equivale a una reducción del 31 % de toda la primera visita. Tácticas ≈16 y avance ≈8 se difieren hasta necesitarlos; no se aumentó el límite de avisos de Vite.

## Jugar contra el ordenador

Primera versión: partida desde la posición inicial, estudiante con blancas, motor con negras, sin reloj, sin cuentas y sin backend. Puedes mover con clics, arrastrar o elegir una jugada legal con el teclado. La promoción exige elegir dama, torre, alfil o caballo; cancelar no mueve el peón. Se admiten enroque y captura al paso. Las reglas detectan jaque, mate y tablas (ahogado, material insuficiente, repetición y cincuenta jugadas). Esta versión termina automáticamente al detectar estas tablas; no implementa un proceso de reclamación arbitral.

El motor usa `Skill Level 0`, `Hash 16` y `go depth 2 movetime 250`. Es una limitación de búsqueda, no una calibración de ELO ni una garantía de rival fácil. No hay análisis, pistas de motor, elección de color ni registro de resultados de partidas en **Mi avance**.

Los controles se bloquean durante carga, pensamiento rival y finales. Un fallo ofrece **Reintentar motor** sin borrar la posición. Reiniciar o salir destruye el worker; las respuestas antiguas no pueden modificar la nueva partida. Visitar **Mi avance** y volver conserva la partida montada. Cambiar de sección o recargar permite recuperarla desde el guardado local. Ninguna partida modifica las claves de progreso de la academia.

### Guardar y retomar una partida

- Se mantiene una sola partida bajo la clave independiente `chess-academy:computer-game:v1`. El registro contiene `{ version: 1, moves: [...] }`, con jugadas UCI confirmadas desde la posición inicial. No se guardan una FEN independiente, el estado interno del motor, selecciones ni promociones pendientes. El turno, los derechos de enroque, la captura al paso y la repetición se reconstruyen del historial completo.
- Se guarda de forma síncrona después de cada jugada legal, incluida la blanca antes de solicitar la respuesta rival. Al abrir **Jugar contra el ordenador**, se recupera automáticamente el registro válido y se muestra un aviso. Si era turno de negras, un worker nuevo continúa desde ese historial; no repite una jugada ya guardada. Las partidas terminadas se recuperan como terminadas y no inician el motor.
- **Nueva partida** pide confirmación si hay jugadas o un registro no recuperable. Confirmar sustituye el registro por una partida vacía; cancelar conserva la anterior. Si falla esa escritura, la nueva partida sigue en memoria con aviso: al salir o recargar podría reaparecer la última guardada. **Reintentar guardado** guarda la posición actual sin reiniciarla.
- Un registro dañado, de una versión desconocida, con jugadas ilegales o posteriores al final no se aplica ni se sobrescribe al montar. Para evitar registros desmesurados, se limita a 2048 medias jugadas y 32 000 caracteres. La interfaz bloquea el tablero hasta confirmar una nueva partida. Un error de lectura ofrece **Reintentar recuperación**, sin escribir sobre la partida desconocida.
- Si el navegador bloquea el guardado o agota la cuota, se conserva la posición en la sección abierta, pero se advierte de la posible pérdida al salir/recargar. Solo el guardado confirmado permite retomarla después. No hay cuentas, sincronización entre dispositivos, sincronización en directo entre pestañas ni historial de varias partidas; si se juega en varias pestañas, prevalece la última escritura.

### Motor y distribución

- Paquete fijado: `stockfish@19.0.1`, variante `lite-single`, sin cambios al motor. Worker clásico y WASM se sirven desde el mismo origen bajo `engine/stockfish-19/`, respetando `BASE_URL`. No se usa CDN en ejecución.
- Worker + WASM ocupan 1 874 201 bytes sin comprimir (~1,87 MB); se descargan solo al entrar en una partida que necesite el motor. La red neuronal ya está integrada en el WASM; no se descarga aparte para jugar. El módulo de interfaz y guardado añade ~17 KB. La entrada general queda en ~413 KB; la primera lección y dependencias, ~585 KB.
- `npm install` prepara los archivos mediante `scripts/prepare-stockfish.mjs`; `npm run dev` y `npm run build` repiten la preparación. Copia únicamente el motor ligero, no los ~205 MB del paquete completo. La primera preparación requiere acceso a GitHub y al archivo NNUE de Stockfish; comprueba los SHA-256 y conserva estos archivos en `public/engine/stockfish-19/` (ignorado por Git). Una vez preparado, compilar no necesita volver a descargarlos.
- El motor es **GPLv3**. Se distribuyen su licencia, créditos, archivo fuente de la etiqueta exacta, red NNUE para recompilar e instrucciones junto al motor; los enlaces están al pie de la partida. No elimines estos archivos al publicar `dist/`. El archivo fuente y la red de compilación se descargan solo si se solicitan sus enlaces, no al jugar. Revisa las obligaciones de distribución y compatibilidad de licencias antes de una publicación comercial; no se afirma que el motor sea MIT.
- El alojamiento estático debe servir `.js` como JavaScript y `.wasm` como `application/wasm`, y permitir Web Workers del mismo origen. No requiere COOP/COEP ni `SharedArrayBuffer`. Usa un navegador moderno compatible con WebAssembly; un fallo de compatibilidad o de carga se informa y permite volver a las lecciones.

Pruebas: cliente UCI (handshake, límites, timeouts y cancelación), controlador (turnos, reinicio, errores, promoción y mate), reglas, guardado/recuperación, registros inválidos, fallos de almacenamiento, navegación, teclado y conservación del progreso. Se verifican los turnos recuperados, partidas terminadas, promoción pendiente, derechos especiales y la protección contra respuestas de un worker anterior. Para una máquina con recursos limitados: `npx vitest run --maxWorkers 2`.
