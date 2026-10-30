# Calidad y alcance

[← Volver al índice y análisis](README.md)

---

## 13. Criterios de calidad y métricas

### 13.1. Calidad técnica

**Correctitud ajedrecística**

- [ ] Movimientos legales y rechazo de movimientos ilegales.
- [ ] Jaque, mate, ahogado y tablas.
- [ ] Enroque y derechos de enroque.
- [ ] Promoción y captura al paso.
- [ ] Importación y exportación de PGN.
- [ ] Lectura y escritura de FEN.
- [ ] Correspondencia entre la posición y el historial de jugadas.
- [ ] Verificación de soluciones y variantes de ejercicios.

**Experiencia de uso**

- [ ] Tablero cómodo con ratón y táctil.
- [ ] Diseño responsive en móviles de gama media.
- [ ] Navegación por teclado donde sea apropiado.
- [ ] Etiquetas y contraste accesibles.
- [ ] Estados de carga, error y reconexión claros.
- [ ] Rendimiento aceptable al utilizar el motor.

**Seguridad e integridad**

- [ ] Sesiones autenticadas correctamente.
- [ ] Autorización para consultar o modificar progreso propio.
- [ ] Validación de entrada en la API.
- [ ] Verificación de resultados educativos en servidor cuando corresponda.
- [ ] Protección contra abuso de endpoints costosos.
- [ ] Registro seguro de errores sin exponer información sensible.

### 13.2. Métricas educativas

Medir al menos:

| Indicador                             | Qué demuestra                              |
| ------------------------------------- | ------------------------------------------ |
| Resolución correcta al primer intento | Desempeño sin ayuda.                       |
| Porcentaje de respuestas con pistas   | Dependencia de asistencia.                 |
| Retención a 7 y 30 días               | Permanencia del aprendizaje.               |
| Rendimiento por tema                  | Fortalezas y debilidades.                  |
| Errores repetidos                     | Conceptos aún no consolidados.             |
| Transferencia a posiciones nuevas     | Capacidad de generalización.               |
| Mejora en partidas de práctica        | Aplicación del conocimiento en juego real. |

**Precaución:** completar lecciones o ganar a un motor con dificultad reducida no equivale automáticamente a un rating ELO concreto. Una medición de fuerza ajedrecística requiere un procedimiento adecuado y datos suficientes.

### 13.3. Definición de MVP exitoso

El MVP se considera funcional cuando una persona puede:

1. Crear una cuenta.
2. Abrir una lección y comprender un concepto.
3. Resolver un ejercicio moviendo piezas sobre un tablero legal.
4. Recibir feedback sobre su respuesta.
5. Jugar contra el motor.
6. Revisar al menos un error de su partida.
7. Estudiar una partida magistral interactiva.
8. Consultar su progreso y una revisión pendiente.
9. Realizar el flujo desde una computadora o un teléfono.

---

---

## 14. Fuera del alcance inicial

No incluir en el MVP:

- Torneos multijugador.
- Partidas online entre usuarios en tiempo real.
- Ranking competitivo y matchmaking.
- Chats comunitarios.
- Entrenadores con avatares animados.
- Entrenamiento de un modelo de IA desde cero.
- Un catálogo masivo de miles de cursos sin revisión.
- Todas las funciones offline desde el primer lanzamiento.

Son posibilidades futuras, pero no son necesarias para demostrar que la plataforma puede enseñar ajedrez eficazmente.

---
