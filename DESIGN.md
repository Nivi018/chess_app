---
name: Academia de ajedrez
description: Una lección interactiva de ajedrez con señalización clara y accesible.
colors:
  teal-de-ruta: "#147b72"
  amarillo-senal: "#f5ce42"
  amarillo-senal-profundo: "#705400"
  tinta: "#173238"
  tinta-suave: "#38524e"
  papel: "#f8faf6"
  fondo: "#f4f7f4"
  verde-salvia: "#dbe6e1"
  verde-salvia-profundo: "#b9cdc2"
  borde: "#c7d5cf"
  texto-atenuado: "#4f6661"
  exito-fondo: "#e6f3ea"
  exito-texto: "#205a38"
  error-fondo: "#fff0e9"
  error-texto: "#7a3422"
typography:
  display:
    fontFamily: "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(28px, 3vw, 38px)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.08em"
rounded:
  board: "3px"
  sm: "4px"
  md: "5px"
  panel: "7px"
  track: "8px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.teal-de-ruta}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 16px"
  button-signal:
    backgroundColor: "{colors.amarillo-senal}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.sm}"
    height: "42px"
    padding: "0 15px"
  input-select:
    backgroundColor: "#ffffff"
    textColor: "{colors.tinta}"
    rounded: "{rounded.sm}"
    height: "42px"
    padding: "0 12px"
  nav-active:
    backgroundColor: "#d2e0d8"
    textColor: "#103e39"
    rounded: "{rounded.md}"
    height: "46px"
    padding: "0 12px"
  challenge-card:
    backgroundColor: "#edf3ee"
    textColor: "#213f3b"
    rounded: "{rounded.md}"
    padding: "17px"
---

# Design System: Academia de ajedrez

## Overview

**Creative North Star: "Señalización de metro para aprender una jugada"**

La interfaz convierte un tablero desconocido en una ruta legible: teal de ruta identifica el entorno y la acción principal; amarillo señal destaca la selección y el destino; los campos de tablero en salvia mantienen el contraste tranquilo. La voz es clara y confiable: instrucciones cortas, coordenadas visibles y feedback textual acompañan la demostración sin sustituir el intento de la persona.

La composición combina superficies claras con bordes finos y sombras ambientales sutiles. La navegación y los controles siguen siendo controles web familiares, directos y accesibles; la metáfora de orientación aparece en el color y el recorrido del caballo, no en mobiliario de mapa o estación. «Academia de ajedrez» es un título neutral para este documento: el nombre visible actual de la app es provisional, no una marca aprobada.

**Key Characteristics:**
- Señalización cromática escasa y con función: teal de ruta, amarillo señal y verde salvia.
- Explicación y feedback textuales junto a un tablero con coordenadas.
- Paneles claros con bordes finos y profundidad ambiental contenida.
- Controles web reconocibles, operables con ratón, tacto y teclado.

## Colors

La paleta combina un teal oscuro y confiable con amarillo de alta visibilidad, superficies salvia y neutrales suaves; los estados de éxito y de nuevo intento tienen colores semánticos diferenciados.

### Primary
- **Teal de ruta**: estructura la barra superior y la acción primaria; también marca el progreso completado.

### Secondary
- **Amarillo señal**: reserva el énfasis para casillas seleccionadas o destino, acciones de comprobación y pequeños indicadores.
- **Amarillo señal profundo**: da borde y contraste al amarillo y forma el contorno de foco visible.

### Tertiary
- **Verde salvia**: alterna las casillas oscuras del tablero y aporta superficies suaves de navegación y reto.
- **Verde salvia profundo**: acompaña los campos claros del tablero para hacer legible la cuadrícula sin recurrir a blanco y negro puros.

### Neutral
- **Tinta**: texto principal y shell oscuro.
- **Tinta suave**: texto secundario con mayor presencia.
- **Papel**: fondo de paneles.
- **Fondo**: lienzo general de la aplicación.
- **Borde**: separación de paneles y estructura de superficies.
- **Texto atenuado**: instrucciones auxiliares, metadatos y etiquetas.

### Named Rules
**The Signal-Purpose Rule.** El amarillo señal identifica una acción o una casilla relevante; no lo uses como relleno decorativo de grandes superficies.

## Typography

**Display Font:** Segoe UI (con system-ui, -apple-system, BlinkMacSystemFont y sans-serif como fallbacks)  
**Body Font:** Segoe UI (con la misma pila de fallbacks)  
**Label/Mono Font:** No hay una familia mono; las coordenadas usan la tipografía de interfaz.

**Character:** Sans serif de sistema, compacta y familiar, con títulos de peso marcado y texto de instrucción abierto y legible. Los rótulos pequeños en mayúsculas orientan dentro de la lección, pero no sustituyen etiquetas descriptivas.

### Hierarchy
- **Display** (700, adaptable de 28 a 38px, line-height 1.12): encabezado principal de la lección.
- **Headline** (700, 22px, line-height 1.2): título del panel de explicación.
- **Title** (700, 16px, line-height 1.3): encabezados de panel y tablero.
- **Body** (400, 14px, line-height 1.6): explicación y texto de lectura continua.
- **Label** (700, 11px, letter-spacing 0.08em, mayúsculas cuando es un índice): rótulos compactos como «TU TURNO».

## Layout

En escritorio, una barra superior de 72px corona una cuadrícula centrada de hasta 1600px, con rail lateral y área de lección. El contenido de lección limita su ancho a 1240px; tablero y explicación se organizan en dos columnas, y el tablero cuadrado mantiene un ancho máximo de 520px. El rail pasa de 228px a 190px bajo 1050px; la composición del tablero y el panel se estrecha con él.

Por debajo de 760px la navegación pasa a una banda compacta con dos acciones y el progreso debajo; la lección cambia a una sola columna, primero el tablero y después la explicación. En pantallas de hasta 390px se reducen los márgenes y el espacio interno del panel para conservar el tablero y los controles en el viewport. El ritmo usa incrementos pequeños y regulares, con gutters mayores para separar áreas; el contenido no depende de una altura fija.

## Elevation & Depth

Sistema híbrido, mayoritariamente plano: los límites se leen mediante superficies claras y bordes finos; la sombra ambiental sutil separa los dos paneles principales del fondo, sin convertirlos en tarjetas flotantes. La elevación no reemplaza el contraste de foco ni el borde.

### Shadow Vocabulary
- **Panel ambiental** (`0 5px 18px rgba(23, 50, 56, .055)`): sombra difusa y discreta en los paneles del tablero y de la lección.

## Shapes

Las esquinas son suavemente redondeadas, no píldoras: el tablero tiene un recorte casi cuadrado; campos, botones y feedback usan radios pequeños; los paneles y pistas amplían apenas el radio. Los bordes finos mantienen visibles los límites de controles y superficies. El tablero conserva su proporción cuadrada y la ruta se dibuja como una línea curva discontinua entre casillas, después de completar la jugada objetivo.

## Components

### Buttons
- **Shape:** esquinas pequeñas (4px), con borde visible en la acción amarilla.
- **Primary:** el botón de repetición usa teal de ruta, texto blanco y altura de 44px; el control principal de respuesta usa amarillo señal y tinta, con altura de 42px.
- **Hover / Focus:** el teal se oscurece al pasar el puntero; el amarillo se aclara. El foco de teclado usa un contorno de 3px en amarillo señal profundo, separado 3px.
- **Secondary / Ghost:** «Necesito una pista» es un control textual teal, sin caja; al pasar el puntero subraya el texto.

### Cards / Containers
- **Corner Style:** paneles de radio suave (7px); el panel de tablero y el explicativo comparten tratamiento.
- **Background:** papel sobre el fondo general; el bloque de reto usa una superficie salvia más marcada.
- **Shadow Strategy:** sombra ambiental sutil únicamente en los dos paneles principales; véase Elevation & Depth.
- **Border:** trazo fino en los paneles y en el bloque de reto.
- **Internal Padding:** fluido en el panel del tablero; compacto y consistente en el panel explicativo.

### Inputs / Fields
- **Style:** selector nativo de fondo blanco, borde salvia medio, radio pequeño y altura de 42px; siempre conserva su etiqueta visible.
- **Focus:** contorno visible de 3px con separación de 3px, compartido con botones y enlaces.
- **Error / Disabled:** no hay un estilo de error del selector; cuando se deshabilita, baja su opacidad y muestra cursor no permitido. El feedback de intento fallido es un bloque textual con fondo y tinta de error.

### Navigation
- **Style:** el rail usa botones de texto e icono con fondo transparente; el activo gana fondo salvia y peso tipográfico. El hover aclara u oscurece el fondo según el estado. En móvil, los dos accesos se muestran juntos y el resumen de progreso ocupa la fila siguiente.

### Chessboard & Route
El tablero usa casillas alternas verde salvia y verde muy claro, con coordenadas visibles y borde fino. Una línea teal identifica la casilla inicial; amarillo señal marca una selección actual. Tras la jugada objetivo correcta aparece la ruta discontinua con extremos marcados y el destino resaltado. Mantén la capa de ruta no interactiva y no reveles el destino antes del intento.

### Feedback
Los mensajes de estado son franjas compactas con icono y texto, no solo cambios de color: neutral en salvia pálido, éxito en verde y nuevo intento en un tono cálido de error. El mensaje se anuncia mediante una región de estado accesible.

## Do's and Don'ts

### Do:
- **Do** usa teal para el shell y la acción primaria, y amarillo señal para énfasis puntuales y la ruta.
- **Do** conserva coordenadas visibles, texto de ayuda y foco de teclado distinguible.
- **Do** combina el color de los estados con iconos y mensajes explicativos.
- **Do** conserva los bordes finos y las sombras ambientales discretas de los paneles.

### Don't:
- **Don't** presentes el rótulo de trabajo actual como nombre de marca aprobado.
- **Don't** reveles la ruta objetivo antes de que la persona intente la jugada.
- **Don't** conviertas la metáfora de señalización en controles o decoración que parezcan mobiliario de estación.
- **Don't** dependas únicamente del color para comunicar foco, progreso o feedback.
