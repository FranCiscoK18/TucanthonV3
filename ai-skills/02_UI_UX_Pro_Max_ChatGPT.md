---
name: ui-ux-pro-max-chatgpt
version: adaptacion-chatgpt-2026-11-17
source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md
scope: ux-design-system-frontend
---

# UI/UX Pro Max — adaptación para ChatGPT Web

> Adaptación práctica en español, **no copia íntegra** de la skill original. La skill publicada incluye datos de estilos, paletas, tipografías, directrices, iconos, animaciones, gráficas y stacks, más buscadores en Python. Este documento no reemplaza esos recursos originales.

## Cuándo aplicar
Para diseñar o implementar páginas, componentes, apps, paneles, sistemas de diseño, navegación, formularios, gráficas, experiencias responsive o para revisar usabilidad y accesibilidad. No aplicarla como requisito a scripts o lógica de backend que no afecten la interfaz.

## 1. Comprender el contexto
Antes de seleccionar estilos, identificar:
- Producto y objetivo: landing, SaaS, e-commerce, portfolio, dashboard, administración, móvil, etc.
- Usuarios y tareas críticas.
- Identidad y restricciones visuales existentes.
- Stack y arquitectura real del proyecto (no suponer React o Tailwind si no está confirmado).
- Estados de la interfaz y dispositivos prioritarios.

## 2. Generar un sistema de diseño
Para páginas nuevas, definir un sistema visual consistente:
- Paleta: primario, secundario, acento, fondos, superficies, texto, bordes y estados.
- Tipografía: familias, escala jerárquica, pesos y alturas de línea.
- Espaciado: escala reusable (por ejemplo 4, 8, 12, 16, 24, 32, 48 px).
- Contenedores, breakpoints, radios, sombras y grosores de borde.
- Componentes: botones, inputs, enlaces, tarjetas, menús, barras, alertas y estados.
- Estados: default, hover, active, focus, disabled, loading, success, warning, error y empty.

Usar variables o tokens compartidos cuando el stack lo admita; evitar valores inconsistentes repetidos a lo largo del proyecto.

## 3. Prioridades de revisión (del original)
1. **Accesibilidad (crítica):** contraste legible, etiquetas, alternativas de texto, foco visible, navegación con teclado.
2. **Interacción táctil (crítica):** objetivos cómodos (idealmente 44×44 px), separación suficiente, feedback de carga y error.
3. **Rendimiento (alto):** imágenes eficientes, lazy loading según corresponda, reservar espacio para evitar cambios de layout.
4. **Estilo (alto):** coherente con el producto; no mezclar estilos porque sí.
5. **Layout/responsive (alto):** móvil funcional, sin scroll horizontal accidental, zoom habilitado.
6. **Tipografía y color:** texto base normalmente 16 px, interlineado legible, contraste suficiente y tokens semánticos.
7. **Animación:** movimientos breves con intención, continuidad espacial y soporte a movimiento reducido.
8. **Formularios:** labels visibles, mensajes cerca del error, ayudas relevantes, estados claros.
9. **Navegación (alto):** rutas predecibles, volver atrás funcional, menús comprensibles y enlaces correctos.
10. **Gráficas:** unidades, etiquetas y leyendas legibles; no depender solo del color.

## 4. Criterios técnicos de accesibilidad
- Contraste de texto normal: objetivo WCAG AA de al menos 4.5:1; texto grande: 3:1. Considerar excepciones definidas por WCAG.
- Navegación por teclado: orden lógico, foco visible y sin trampas de teclado.
- Botones de icono: nombre accesible cuando el significado no se expresa en texto.
- Imágenes informativas: texto alternativo adecuado; decorativas: alternativas vacías.
- Formularios: asociar etiquetas y explicar errores con texto, no solo con color.
- Evitar interacciones que funcionen únicamente con hover.
- Respetar `prefers-reduced-motion` en las animaciones.

## 5. Diseño adaptable
- Comenzar por las tareas principales en móvil y ampliar el layout al aumentar ancho.
- Evitar contenedores rígidos que produzcan cortes o scroll horizontal.
- Comprobar encabezados largos, traducciones, errores y estados vacíos.
- Los menús deben poder abrirse, cerrarse y recorrerse con teclado y tacto.
- Considerar safe areas, orientación y aumento de texto cuando aplique.

## 6. Formularios y datos
- Un campo debe tener propósito, etiqueta clara, tipo apropiado y validación comprensible.
- Estados de guardado y errores asíncronos deben comunicarse.
- En dashboards priorizar el dato más importante; usar tablas y gráficas cuando ayuden a interpretar.
- Las gráficas deben indicar qué mide cada eje, sus unidades y contexto; no inventar datos.

## 7. Flujo operativo en ChatGPT
1. Revisar el encargo y detectar stack y estado del proyecto.
2. Definir o recuperar design tokens.
3. Crear la estructura semántica y la jerarquía de información.
4. Implementar componentes y estados interactivos.
5. Resolver accesibilidad, respuesta móvil y performance.
6. Revisar consistencia visual con Taste Skill cuando corresponda.
7. Probar realmente con herramientas disponibles; informar claramente limitaciones de prueba.

## 8. Lista de comprobación antes de entregar
- [ ] Tipografía y jerarquía coherentes.
- [ ] Colores definidos con tokens y contraste suficiente.
- [ ] Foco de teclado perceptible.
- [ ] Targets táctiles adecuados.
- [ ] Formularios con etiquetas y mensajes de error.
- [ ] Sin desbordamientos en móvil.
- [ ] Estados de carga, error y vacío previstos.
- [ ] Animaciones con respeto al movimiento reducido.
- [ ] Imágenes con medidas y carga apropiadas.
- [ ] Navegación entendible y rutas funcionales.
- [ ] Distinción clara entre pruebas ejecutadas y supuestos.

## Nota de compatibilidad
La skill original consulta bases de datos y scripts con `search.py`, además de archivos de referencia. Al compartir solo este Markdown en ChatGPT Web, esos recursos no quedan instalados. Cuando el problema requiera una paleta, estilo o recomendación específica de la base original, abrir el repositorio y consultar sus referencias antes de atribuirle una recomendación precisa.

**Fuente:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill