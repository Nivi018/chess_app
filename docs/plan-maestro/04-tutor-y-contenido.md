# Tutor y contenido

[← Volver al índice y análisis](README.md)

---

## 11. Segunda etapa: entrenador inteligente avanzado

Estas capacidades se incorporan después de verificar que el MVP educativo funciona correctamente.

### 11.1. Tutor conversacional

Permitir al usuario preguntar, por ejemplo:

- ¿Por qué mi sacrificio no funcionó?
- ¿Qué plan tenía mi rival?
- ¿Por qué Stockfish prefiere esta jugada?
- ¿Cómo puedo identificar este patrón en otras partidas?

**Contexto mínimo recomendado para el tutor:**

1. Posición FEN y último movimiento.
2. Variantes verificadas por Stockfish.
3. Objetivo de la lección y conceptos etiquetados.
4. Historial educativo pertinente del usuario.
5. Límites de la explicación: distinguir hechos calculados, criterios posicionales y estimaciones.

### 11.2. Análisis pedagógico automático

Después de una partida, el sistema podrá:

- Detectar omisión de amenazas.
- Identificar errores de cálculo.
- Detectar problemas recurrentes de apertura o desarrollo.
- Reconocer fallos en finales.
- Crear una lista de posiciones para revisar.
- Recomendar ejercicios relacionados con esos errores.

El análisis debe evitar clasificar automáticamente todos los errores como fallos de comprensión: una jugada inferior puede deberse a tiempo, complejidad táctica o simple descuido.

### 11.3. Entrenamiento adaptativo

- Ajustar dificultad de ejercicios.
- Repetir conceptos según desempeño.
- Recomendar lecciones por prerrequisitos no dominados.
- Proponer sesiones mixtas de táctica, estrategia, cálculo y finales.
- Revisar periódicamente si el aprendizaje se transfiere a partidas nuevas.

---

---

## 12. Fuentes de contenido y licencias

### 12.1. Bases de datos útiles

**Lichess Open Database:** <https://database.lichess.org/>

Puede utilizarse para investigar fuentes de partidas, posiciones, evaluaciones y ejercicios. Es conveniente importar inicialmente una selección pequeña y curada, en lugar de integrar millones de registros sin validación pedagógica.

**Recomendaciones de importación:**

1. Identificar la fuente y su licencia específica.
2. Importar PGN y metadatos.
3. Validar formato y legalidad.
4. Extraer posiciones críticas.
5. Calcular o contrastar soluciones.
6. Etiquetar tema, dificultad y objetivos.
7. Redactar explicación pedagógica original.
8. Revisar manualmente antes de publicar.

### 12.2. Consideraciones legales

- Las exportaciones generales de partidas de Lichess pueden tener condiciones distintas de sus conjuntos de retransmisiones; comprobar la licencia del **dataset concreto**.
- Los movimientos de una partida y sus metadatos no habilitan automáticamente copiar análisis, diagramas comentados o textos de terceros.
- Mantener atribuciones y obligaciones de redistribución cuando corresponda.
- Stockfish se distribuye bajo **GPLv3**; revisar sus obligaciones al distribuirlo dentro de una aplicación o instalador.
- Las licencias de imágenes, retratos y material audiovisual deben revisarse por separado.

> Esta sección sirve como checklist técnico-editorial; antes de redistribuir software o contenido debe revisarse la licencia aplicable a cada versión y recurso concreto.

---
