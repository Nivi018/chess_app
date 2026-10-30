# Plan maestro — Academia de ajedrez

Esta carpeta organiza el plan original en documentos temáticos para facilitar su lectura, revisión y evolución. El documento fuente `plan_maestro_academia_ajedrez.md` se conserva intacto en la raíz del proyecto.

## Documentos

1. [Producto y aprendizaje](01-producto-y-aprendizaje.md) — visión, estrategia multiplataforma, metodología, currículo y grandes maestros.
2. [Funcionalidades y arquitectura](02-funcionalidades-y-arquitectura.md) — módulos, stack, arquitectura, datos y API.
3. [Hoja de ruta del MVP](03-hoja-de-ruta-mvp.md) — fases, hitos, metas de contenido y primer sprint.
4. [Tutor y contenido](04-tutor-y-contenido.md) — segunda etapa, entrenamiento adaptativo, fuentes y licencias.
5. [Calidad y alcance](05-calidad-y-alcance.md) — criterios técnicos, métricas, definición de éxito y exclusiones.
6. [Prioridades y referencias](06-prioridades-y-referencias.md) — prioridades de producto y referencias técnicas.

## Análisis del plan

### Valoración general

El plan tiene una propuesta educativa clara: diferenciarse de una aplicación de juego mediante razonamiento guiado, explicaciones verificables y práctica conectada con el progreso. También acierta al separar las reglas de ajedrez, el motor de análisis y el tutor, y al recomendar validar primero una experiencia web antes de empaquetar aplicaciones nativas.

El principal riesgo no es la dirección del producto, sino la amplitud del MVP. El alcance descrito incluye plataforma, autenticación, contenido propio, biblioteca de ejercicios, partidas con motor, análisis, material de grandes maestros, progreso adaptativo y publicación en unas 20 semanas de dedicación parcial. Es una estimación optimista si el trabajo depende de una sola persona o si también hay que producir y revisar el contenido.

### Riesgos y decisiones pendientes

1. **Reducir y definir el MVP.** El primer sprint propone una vertical slice adecuada, pero después el calendario amplía rápidamente el alcance. Conviene tratar esa slice como una puerta de validación y decidir qué módulos son imprescindibles antes de comprometer las 20 semanas.
2. **Aclarar qué significa “entrenador inteligente” en el MVP.** El documento pospone el tutor conversacional, pero incluye explicaciones y análisis educativos desde la primera versión. Definir qué se resuelve con reglas deterministas, contenido editorial y Stockfish evitará expectativas ambiguas.
3. **Validar la estimación y los entregables de contenido.** Diez lecciones, 300 ejercicios y diez partidas comentadas son objetivos editoriales sustanciales; falta estimar su autoría, revisión ajedrecística, etiquetado y control de licencias por separado del desarrollo técnico.
4. **Cerrar el modelo de confianza del motor.** Se propone ejecutar Stockfish localmente y también guardar partidas y análisis mediante la API. Falta decidir qué resultados se recalculan o verifican en servidor, qué ocurre sin soporte WASM y cómo se limita el consumo de CPU, batería y recursos del backend.
5. **Precisar autenticación, privacidad y usuarios menores.** Al tratarse de una academia, conviene definir desde el inicio qué datos personales y de aprendizaje se guardan, cuánto tiempo se conservan, cómo se eliminan y qué requisitos aplican si participan menores.
6. **Operacionalizar las métricas.** Las métricas educativas son pertinentes, pero aún no tienen eventos, fórmulas, umbrales de éxito ni estrategia de privacidad. No conviene interpretar finalización o victorias como evidencia automática de aprendizaje.
7. **Comprobar supuestos tecnológicos y legales.** El stack se presenta como elegido y se afirma que debe aprovechar una arquitectura existente, pero el repositorio inspeccionado contiene el plan, no una implementación que confirme esa base. Antes de fijar dependencias, revisar versiones, compatibilidad, mantenimiento y licencias concretas, especialmente las de Stockfish y los datasets.

### Recomendación inmediata

Usar el primer sprint como experimento de producto: una lección, una posición validada, movimiento legal, feedback y progreso persistido. Al terminar, decidir con evidencia si se continúa con cuentas y API completas, o si primero conviene validar el valor educativo con una versión local más pequeña. Añadir criterios de aceptación verificables para esa slice y una estimación separada de producción de contenido.

### Trazabilidad

Los documentos temáticos conservan el contenido de las secciones del plan original; la numeración original se mantiene para facilitar la comparación. El análisis anterior añade observaciones y recomendaciones, no modifica las decisiones del documento fuente.
