# Hoja de ruta del MVP

[← Volver al índice y análisis](README.md)

---

## 10. Ruta completa de desarrollo

**Estimación:** 20 semanas con una dedicación aproximada de 12–20 horas semanales. El calendario es orientativo y puede alargarse por pruebas, producción de material educativo o distribución en tiendas.

### Fase 1 — Definición del producto y prototipo (semanas 1–2)

**Objetivo:** delimitar el MVP y diseñar la experiencia central de aprendizaje.

**Actividades**

- [ ] Definir el perfil del primer usuario objetivo.
- [ ] Formalizar requerimientos funcionales y no funcionales.
- [ ] Priorizar las funciones del MVP.
- [ ] Diseñar navegación responsive y estructura de pantallas.
- [ ] Prototipar tablero, lección, ejercicio y reporte de progreso.
- [ ] Definir criterios de éxito para el producto y la primera unidad educativa.

**Entregable:** prototipo navegable y backlog priorizado.

### Fase 2 — Fundamentos técnicos (semanas 3–4)

**Objetivo:** preparar una plataforma que permita agregar funciones sin rehacer la arquitectura.

**Actividades**

- [ ] Inicializar monorepo y workspaces.
- [ ] Configurar React, TypeScript y Vite.
- [ ] Configurar Hono y estructura modular de backend.
- [ ] Preparar PostgreSQL y Prisma.
- [ ] Implementar Better Auth e integración de sesiones en frontend.
- [ ] Crear el paquete `ui` con wrappers de componentes.
- [ ] Establecer linting, formateo, pruebas y convenciones de desarrollo.

**Entregable:** aplicación accesible con registro, inicio de sesión y navegación funcional.

### Fase 3 — Núcleo de ajedrez (semanas 5–6)

**Objetivo:** construir un tablero reutilizable, estable y correcto.

**Actividades**

- [ ] Integrar `chess.js` y `react-chessboard`.
- [ ] Validar movimientos legales y turnos.
- [ ] Implementar jaque, mate, ahogado, promociones, enroque y captura al paso.
- [ ] Importar y exportar FEN y PGN.
- [ ] Mostrar historial de movimientos.
- [ ] Agregar flechas, casillas destacadas y navegación de variantes.
- [ ] Probar interacciones con ratón y pantalla táctil.

**Entregable:** tablero funcional para PC y móvil, listo para reutilizarse en toda la aplicación.

### Fase 4 — Academia y lecciones (semanas 7–9)

**Objetivo:** publicar un primer curso interactivo.

**Actividades**

- [ ] Modelar cursos, unidades, lecciones y pasos.
- [ ] Crear reproductor de contenido educativo.
- [ ] Implementar preguntas de opción múltiple y ejercicios en tablero.
- [ ] Construir sistema de pistas y retroalimentación.
- [ ] Validar soluciones con el núcleo de reglas.
- [ ] Registrar completitud e intentos.
- [ ] Elaborar diez lecciones iniciales curadas.

**Entregable:** curso introductorio de 10 lecciones completas e interactivas.

### Fase 5 — Entrenamiento táctico (semanas 10–11)

**Objetivo:** establecer una biblioteca inicial de práctica deliberada.

**Actividades**

- [ ] Diseñar importador de ejercicios.
- [ ] Validar posiciones y soluciones.
- [ ] Clasificar por temática y dificultad.
- [ ] Registrar intentos, tiempo y pistas.
- [ ] Presentar ejercicios según dificultad inicial estimada.
- [ ] Incorporar filtros y estadísticas básicas.

**Entregable:** sistema de ejercicios con un conjunto inicial curado; meta de alcance de 300 ejercicios.

### Fase 6 — Partidas contra IA (semanas 12–14)

**Objetivo:** permitir práctica real contra un oponente artificial.

**Actividades**

- [ ] Integrar Stockfish en un worker cuando la plataforma lo soporte.
- [ ] Implementar comunicación UCI.
- [ ] Ofrecer niveles de dificultad y selección de color.
- [ ] Permitir partidas completas y posiciones iniciales específicas.
- [ ] Guardar partidas, movimientos y resultados.
- [ ] Implementar un análisis posterior básico.
- [ ] Probar rendimiento y consumo en dispositivos móviles.

**Entregable:** partidas completas contra motor y revisión inicial de errores.

### Fase 7 — Biblioteca de grandes maestros (semanas 15–16)

**Objetivo:** convertir partidas históricas en entrenamiento guiado.

**Actividades**

- [ ] Importar PGN seleccionados con metadatos.
- [ ] Construir catálogo y visor de partidas.
- [ ] Anotar posiciones críticas con comentarios originales.
- [ ] Implementar preguntas de predicción de jugadas.
- [ ] Permitir practicar desde una posición histórica.
- [ ] Documentar procedencia y licencias.

**Entregable:** diez partidas magistrales comentadas e interactivas.

### Fase 8 — Progreso y personalización (semanas 17–18)

**Objetivo:** conectar las actividades con un plan de mejora individual.

**Actividades**

- [ ] Implementar panel de progreso.
- [ ] Calcular dominio inicial por habilidad.
- [ ] Recomendar ejercicios a partir de errores.
- [ ] Programar revisiones espaciadas.
- [ ] Mostrar fortalezas y debilidades sin presentar resultados engañosos.
- [ ] Añadir pruebas de persistencia y consistencia.

**Entregable:** perfil educativo y plan básico de estudio personalizado.

### Fase 9 — Calidad y publicación del MVP (semanas 19–20)

**Objetivo:** lanzar la primera versión usable de principio a fin.

**Actividades**

- [ ] Ejecutar pruebas unitarias, integración y E2E.
- [ ] Verificar movimientos especiales y posiciones límite.
- [ ] Probar experiencia responsive y accesibilidad.
- [ ] Revisar autenticación, autorizaciones y seguridad de API.
- [ ] Optimizar recursos, cargas y memoria.
- [ ] Preparar despliegue web, HTTPS y PWA.
- [ ] Crear un proceso para recopilar feedback y errores reales de usuarios.

**Entregable:** MVP publicado, instalable donde el navegador lo permita y funcional en computadoras y teléfonos.

### 10.1. Resumen de hitos

| Fase               | Semanas | Resultado                                 |
| ------------------ | ------- | ----------------------------------------- |
| 1. Producto        | 1–2     | Prototipo y alcance validable.            |
| 2. Infraestructura | 3–4     | Aplicación con autenticación.             |
| 3. Ajedrez         | 5–6     | Tablero legal y reutilizable.             |
| 4. Academia        | 7–9     | Diez lecciones iniciales.                 |
| 5. Táctica         | 10–11   | Entrenamiento y biblioteca de ejercicios. |
| 6. IA de juego     | 12–14   | Partidas contra Stockfish.                |
| 7. Maestros        | 15–16   | Diez partidas comentadas.                 |
| 8. Progreso        | 17–18   | Perfil y repaso adaptativo básico.        |
| 9. Lanzamiento     | 19–20   | PWA pública y probada.                    |

### 10.2. Metas de contenido para el MVP

- **10** lecciones interactivas iniciales.
- **300** ejercicios seleccionados y validados (meta).
- **10** partidas magistrales comentadas.
- **1** experiencia de juego contra Stockfish.
- **1** panel básico de progreso y revisiones.

Estas cifras son **objetivos de alcance**, no recursos ya creados ni plazos garantizados.

---

---

## 15. Primer sprint recomendado

### Objetivo: una lección de extremo a extremo

Construir una **vertical slice** que conecte frontend, lógica de ajedrez, API y persistencia.

**Historia de usuario:**

> Como estudiante quiero abrir una lección, estudiar una posición, realizar una jugada legal, recibir una explicación y guardar mi progreso para continuar después.

### 15.1. Alcance técnico

- [ ] Mostrar tablero con una posición FEN definida.
- [ ] Permitir movimientos mediante ratón y táctil.
- [ ] Validar el movimiento con `chess.js`.
- [ ] Comparar la respuesta con una solución configurada.
- [ ] Mostrar retroalimentación y una pista opcional.
- [ ] Guardar el intento en el backend.
- [ ] Actualizar el progreso del usuario.
- [ ] Mostrar el resultado después de recargar la página.

### 15.2. Resultado esperado

Una única lección funcionando de principio a fin, utilizando el mismo componente de tablero que más adelante se empleará para:

- Academia.
- Táctica.
- Partidas magistrales.
- Arena contra IA.
- Análisis posterior.

El éxito de este sprint confirma la estructura técnica sobre la que se ampliará el resto del producto.

---
