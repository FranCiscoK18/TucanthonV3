---
name: design-taste-frontend-chatgpt
version: adaptacion-chatgpt-2026-11-17
source: https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md
scope: diseno-frontend
---

# Taste Skill — adaptación para ChatGPT Web

> Adaptación práctica en español, **no copia íntegra** del archivo original. Consultar la fuente enlazada cuando se necesiten instrucciones, referencias o scripts específicos.

## Cuándo aplicar
Usar cuando el usuario pida diseñar, implementar, mejorar, rediseñar o criticar la presentación visual de una web, landing page, tienda, página de producto, SaaS, estudio, restaurante o aplicación. No aplicar mecánicamente a tareas de backend.

## Principio central
Producir un sitio que parezca creado para **ese cliente y producto**, no una plantilla genérica. El visitante debe entender rápidamente qué ofrece la web, por qué importa y qué puede hacer. El contenido y los recursos visuales deben representar el producto auténtico.

## 1. Definir antes de dibujar
- Identificar tipo de negocio: software, juego, hardware, producto físico, servicio o lugar físico.
- Definir audiencia, propuesta de valor, acción principal, contenido disponible, tono y personalidad.
- Elegir una sola dirección de arte coherente. Evitar mezclar lenguajes visuales arbitrariamente.
- Tomar decisiones de composición según la naturaleza del negocio; no diseñar todas las webs como si fueran SaaS.

## 2. Contenido visual pertinente
- **Software / SaaS:** priorizar capturas o demostraciones reales de la interfaz y situaciones de uso. Puede incluir diagramas técnicos pertinentes.
- **Producto físico:** mostrar el producto en escala útil, desde diferentes ángulos y en escenas que expliquen sus beneficios.
- **Servicios:** mostrar personas, trabajo, resultados, espacios y señales de confianza verificables.
- **Restaurantes, hoteles y lugares físicos:** priorizar fotografías genuinas del espacio y de la experiencia. Evitar efectos técnicos ostentosos.
- No inventar testimonios, acreditaciones, precios, estadísticas, clientes o fotografías atribuidas falsamente a la marca.
- Si faltan imágenes reales, usar placeholders identificados o imágenes de referencia cuya procedencia y derechos puedan comprobarse.

## 3. Composición y jerarquía
- La cabecera inicial (hero) debe comunicar una promesa clara y dar una acción principal reconocible.
- Cada sección debe cumplir una función. Reducir redundancias en títulos, argumentos y elementos visuales.
- Mantener bordes y alineaciones coherentes entre secciones, márgenes equilibrados y una retícula repetible.
- Dar suficiente espacio a cada sección para comunicar una idea, evitando pantallas saturadas.
- Alternar composiciones con intención sin romper la unidad estética. No repetir la misma distribución de tarjetas en todas las secciones.
- Dar protagonismo al producto, experiencia o contenido, no a decoraciones vacías.
- No incluir subtítulos decorativos, etiquetas o textos de relleno solo para ocupar espacio.

## 4. Estilo visual
- Definir tipografías con contraste claro entre encabezados, subtítulos y cuerpo.
- Utilizar recursos gráficos y fotografías de buena calidad, con proporciones y recortes bien elegidos.
- Preferir un diseño con personalidad concreta frente a fondos de gradientes, tarjetas redondeadas y efectos genéricos repetidos sin motivo.
- Reservar escenas avanzadas, shaders y efectos cinematográficos para productos donde tengan sentido (por ejemplo, tecnología, videojuegos o herramientas de desarrollo).
- Para productos locales y servicios cotidianos, favorecer fotografía, buen texto, color y disposición espacial.

## 5. Movimiento e interacción
- Usar microinteracciones discretas con propósito: hover, presión de botones, transición de subrayados y pequeños desplazamientos.
- Mantener la animación subordinada al contenido; evitar movimiento constante sin valor funcional.
- Una transición de entrada bien resuelta puede mejorar el hero, pero no debe ocultar elementos esenciales.
- Respetar `prefers-reduced-motion`, teclado y dispositivos táctiles.
- No depender del hover para transmitir información indispensable.

## 6. Adaptabilidad
Diseñar y revisar al menos estos anchos de referencia cuando haya herramientas disponibles:
- 1440 px (escritorio amplio)
- 1024 px (escritorio compacto/tableta horizontal)
- 768 px (tableta)
- 390 px (móvil)

En cada ancho comprobar que no haya desbordamientos, texto cortado, elementos invisibles, botones diminutos o secciones que pierdan su mensaje.

## 7. Flujo operativo en ChatGPT
1. Leer el encargo y el código existente, cuando lo haya.
2. Determinar categoría de página y necesidades reales.
3. Proponer un concepto visual breve: tipografía, color, referencias, retícula, hero y secciones.
4. Crear componentes y contenido funcional, respetando el stack existente.
5. Ajustar responsive e interacciones.
6. Revisar la presentación visual y refinar detalles.
7. Si hay navegador disponible, inspeccionar vistas reales y corregir defectos. Si no lo hay, declarar explícitamente que la revisión visual queda pendiente.

## 8. Lista de comprobación antes de entregar
- [ ] Es obvio qué hace el negocio/producto desde el primer pantallazo.
- [ ] Hay una acción principal inequívoca.
- [ ] Cada sección aporta un dato o beneficio diferente.
- [ ] El diseño tiene identidad propia y no parece una plantilla genérica.
- [ ] Los recursos visuales representan el producto o servicio y no engañan.
- [ ] Espaciado, bordes y alineaciones son coherentes.
- [ ] Las interacciones son discretas, accesibles y funcionales.
- [ ] El móvil está resuelto, no solo comprimido.
- [ ] Se sabe qué pruebas se hicieron de verdad y cuáles quedan pendientes.

## Nota de compatibilidad
La skill original incorpora scripts, referencias y verificaciones automáticas. Este archivo **no reproduce** ese mecanismo. No afirmar que se ha ejecutado un `gate`, un hook de navegador o una comprobación automática si no se ha ejecutado realmente.

**Fuente:** https://github.com/Leonxlnx/taste-skill