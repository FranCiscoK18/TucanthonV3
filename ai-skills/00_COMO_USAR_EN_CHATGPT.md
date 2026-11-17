# Kit de diseño frontend para ChatGPT Web

## Propósito
Este paquete permite que ChatGPT use una adaptación práctica de dos skills de código abierto al trabajar en páginas web, componentes, landing pages y aplicaciones:

1. `01_Taste_Skill_ChatGPT.md` — dirección de arte, composición y calidad visual.
2. `02_UI_UX_Pro_Max_ChatGPT.md` — sistema de diseño, accesibilidad, usabilidad y coherencia.

> **Importante:** Estos son archivos de instrucciones **adaptados para ChatGPT Web**; no son copias integrales de los `SKILL.md` originales ni instalan extensiones, scripts o capacidades nuevas. Los originales contienen archivos adicionales y herramientas que podrían requerir un agente con acceso al sistema y al navegador.

### Fuentes originales
- Taste Skill: https://github.com/Leonxlnx/taste-skill
- SKILL.md original: https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md
- UI/UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- SKILL.md original: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md

## Cómo usar el paquete

**En un chat puntual:** adjunta los tres archivos `.md` a tu conversación y escribe:

> Usa las dos guías de diseño adjuntas para crear o mejorar el frontend. Aplica Taste Skill para la dirección visual y UI/UX Pro Max para la coherencia, la accesibilidad y la experiencia de usuario. Adapta las reglas al tipo de producto y a mi stack. Si necesitas detalles adicionales, consulta las fuentes originales enlazadas. No afirmes haber ejecutado verificaciones visuales o scripts si no pudiste hacerlo.

**En un Proyecto de ChatGPT:** agrega los archivos como archivos del proyecto; agrega a las instrucciones del proyecto: "Para tareas visuales de frontend, consultar 00_COMO_USAR_EN_CHATGPT.md, 01_Taste_Skill_ChatGPT.md y 02_UI_UX_Pro_Max_ChatGPT.md."

**Para conservar instrucciones sin subir archivos:** pega el prompt anterior en las instrucciones de tu proyecto y agrega enlaces a las fuentes. Tener enlaces no significa que ChatGPT haya leído automáticamente todo el repositorio.

## Reglas de precedencia
1. Requisitos expresos del usuario, código existente, seguridad y accesibilidad.
2. Objetivo, identidad, público y contenido real del producto.
3. UI/UX Pro Max para estructura, interacción, accesibilidad y design tokens.
4. Taste Skill para personalidad visual, storytelling y acabado.
5. En caso de conflicto, favorece claridad, accesibilidad, consistencia y rendimiento. No copies ciegamente reglas estéticas que empeoren el producto.

## Entregables esperados
- Interfaz funcional, no solo descripción visual.
- Diseño adaptable a móvil, tablet y escritorio.
- Tipografía, colores, espaciado y componentes consistentes.
- Navegación accesible y feedback de estados.
- Contenido verosímil sin inventar datos de cliente.
- Revisión honesta: distinguir comprobaciones ejecutadas de recomendaciones pendientes.

## Limitaciones
- Cargar un `.md` en el chat permite usar su contenido como referencia, pero **no instala una skill permanente en el modelo**.
- Los scripts, hooks y buscadores locales de los proyectos originales no quedan instalados ni se ejecutan por subir este paquete.
- Si no hay navegador o entorno de ejecución disponible, ChatGPT debe informar que la validación responsive y las pruebas interactivas están pendientes.