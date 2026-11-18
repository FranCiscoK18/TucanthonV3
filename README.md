# Ondara Cancún — Plataforma de Inteligencia Epidemiológica Participativa

**Frontend DEMO.** React + TypeScript (estricto) + Vite + Tailwind CSS v4 + React Router + MapLibre GL JS + Recharts.

> **Ondara complementa, no sustituye, a las autoridades sanitarias. No diagnostica ni confirma casos. Información DEMO para validación.**
>
> Todos los datos son simulados y llevan `isDemo: true` en el código y la etiqueta **DEMO** en la interfaz. No hay backend, base de datos, autenticación real ni integración con sistemas oficiales. Ninguna pantalla muestra datos personales, domicilios ni ubicaciones individuales.

## Instalación y ejecución

Requisitos: Node.js 20.19+ o 22+ y npm.

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite (normalmente `http://localhost:5173`).

Otros comandos:

```bash
npm run typecheck   # tsc estricto, sin emitir
npm run build       # typecheck + build de producción en dist/
npm run preview     # sirve dist/
```

No se necesitan variables de entorno. El **mapa base** necesita Internet (teselas de OpenStreetMap); si no cargan, las capas DEMO por zona siguen visibles sobre un fondo liso.

### Modo prueba (errores simulados)

Los servicios simulados tienen latencia de 300–800 ms y pueden fallar a propósito para probar estados de error:

- URL: `http://localhost:5173/?modoPrueba=1` (30 % de fallos)
- Variable: `VITE_DEMO_ERROR_RATE=0.3 npm run dev`
- Interruptor en **Administración → Configuración** (rol `admin`, solo en memoria)

La configuración vive en un solo lugar: `src/config/demo.ts`.

## Estructura

```
src/
├── app/                 # Router, sesión mock, guardas de rol, matriz de acceso y menú por rol
├── components/
│   ├── layout/          # Header, navegación lateral (escritorio), pestañas inferiores (móvil), footer con avisos
│   ├── map/             # OndaraMap (MapLibre, 6 capas separadas)
│   ├── charts/          # TrendChart y PeriodBars (Recharts), Sparkline (SVG propio)
│   └── ui/              # Badges (DEMO, tipo de dato, estado), estados de carga/vacío/error, formularios, layout
├── config/              # demo.ts (latencia, tasa de error, claves de localStorage) y dataKinds.ts (color+icono+forma por tipo de dato)
├── hooks/               # useAsync (carga, error, reintento, condiciones de carrera), useDocumentTitle
├── mocks/               # Datos DEMO centralizados y deterministas (semilla fija)
├── pages/               # Una vista por ruta (carga diferida)
├── services/            # Funciones async simuladas con latencia y fallo configurable
├── types/               # Modelo de datos TypeScript
└── utils/               # Fechas, formato, CSV, cálculo de señales
```

## Rutas

| Ruta | Vista | Acceso |
|---|---|---|
| `/` | Inicio: qué es y qué no es, avisos informativos, resumen de enfermedades, accesos rápidos | Público |
| `/como-funciona` | Flujo de seis etapas, regla de integridad, estados, canales | Público |
| `/mapa` | Mapa por capas, filtros, panel de zona, tabla alternativa | Público |
| `/enfermedades` | Catálogo con clasificación y señales | Público |
| `/enfermedades/:id` | Tendencia, criterios de señal, comparación de periodos, tabla | Público |
| `/brigadas` · `/brigadas/:id` | Lista/mapa de brigadas, campañas, detalle | Público |
| `/reportes` | Formulario de reporte anónimo | Público |
| `/normativa` | Marcos a revisar, privacidad, fuentes DEMO | Público |
| `/acceso` | Selector de rol mock | Público |
| `/reportes/mios` | Reportes propios con historial de estados | `ciudadano`, `admin` |
| `/institucion` | Métricas, zonas prioritarias, agregados, CSV, piloto de 90 días | `institucion`, `admin` |
| `/administracion` | Fuentes, moderación, bitácora, configuración de módulos A/B | `admin` |
| `/sin-permiso`, `*` | Sin permiso / no encontrada | Público |

## Roles mock

| Rol | Acceso |
|---|---|
| invitado (sin sesión) | Inicio, cómo funciona, mapa, enfermedades, brigadas y normativa. Puede enviar reportes. |
| ciudadano | Lo anterior, más seguimiento de reportes propios. |
| institucion | Lo público, más el panel institucional con datos agregados. |
| admin | Todo, incluida administración y bitácora. |

- La sesión se elige en `/acceso` y se guarda en `localStorage`. **No es autenticación**: las guardas son solo de interfaz y se pueden eludir desde las herramientas del navegador.
- Sin sesión, una ruta protegida redirige a `/acceso` (y vuelve al destino tras elegir un rol permitido). Con un rol sin permiso, redirige a `/sin-permiso`.
- El menú (lateral y pestañas inferiores) solo muestra los módulos que el rol puede abrir (`src/app/navigation.ts`, `src/app/access.ts`).

## Datos DEMO (`src/mocks`)

| Archivo | Contenido |
|---|---|
| `regions.ts` | 7 zonas amplias de Cancún con polígonos **ilustrativos** (no límites oficiales) y población estimada |
| `diseases.ts` | 10 enfermedades en 5 clasificaciones; `AggregatedCase` (zona × semana × enfermedad, `source: "oficial-demo"`); `VectorRecord` |
| `reports.ts` | `CitizenReport` de terceros (generados con semilla), etiquetas y significado de estados, derivación de `ReviewedObservation` |
| `brigades.ts` | `VaccinationBrigade` y `Campaign` ficticias, ubicadas por zona |
| `alerts.ts` | `Alert` informativos con fuente, fecha, criterio y limitación |
| `institutional.ts` | `Indicator`, zonas prioritarias, `PilotStage`, preguntas de decisión, marcos normativos |
| `sources.ts` | `DataSource` con tipo, responsable, periodo, corte, cobertura y limitaciones |

Los datos son deterministas (generador con semilla) y tienen fecha de corte fija **15-nov-2026** (semanas 35–46).

### Persistencia

Solo tres claves de `localStorage` (`src/config/demo.ts`):

| Clave | Contenido |
|---|---|
| `ondara-demo:sesion` | Rol mock |
| `ondara-demo:reportes-propios` | Reportes creados en este navegador (solo el nombre de la foto, nunca la imagen) |
| `ondara-demo:bitacora` | Bitácora de acciones simuladas (sin datos personales) |

Si `localStorage` no está disponible, la app sigue funcionando en memoria. La moderación de reportes de terceros y los cambios de fuentes viven en memoria y se reinician al recargar.

## Decisiones tomadas

1. **Reconstrucción completa.** El repositorio contenía un prototipo anterior («EpiRadar Cancún») con otro alcance (rutas solo para ciudadano, 4 capas, sin acceso público). Se reemplazó `src/` por la implementación de Ondara; se conservan `AGENTS.md`, `DESIGN.md` y `ai-skills/`.
2. **Documento conceptual.** La «Propuesta conceptual: Inteligencia epidemiológica participativa» no está en el repositorio. Los textos de qué es / qué no es, el flujo de seis etapas, las métricas primarias y el piloto se tomaron de lo citado en el encargo. **Las cinco preguntas de decisión se derivaron de las cinco métricas primarias y deben validarse con el documento.**
3. **Seis capas, seis codificaciones.** Oficial = relleno de zona en verdes; estimado = contorno punteado + etiqueta «≈»; reporte ciudadano = círculo azul; observación revisada = rombo violeta; brigada = cuadrado magenta «+»; vectorial = hexágono ocre. Cada una con icono y etiqueta textual (`src/config/dataKinds.ts`). Con seis categorías ningún conjunto de colores es distinguible para todo tipo de daltonismo; por eso la forma, el icono y la etiqueta son la identidad principal, y el color es secundario.
4. **Marcadores como botones HTML** (no símbolos WebGL) para que sean accesibles con teclado y lector de pantalla, sin depender de fuentes de glifos externas. Además hay una **tabla de zonas** como alternativa al mapa.
5. **Indicador estimado:** tasa = registros DEMO del periodo ÷ población estimada de la zona × 10 000. Se explica en el panel de la zona y en la fuente.
6. **Privacidad en capas ciudadanas:** conteos de 1–2 se muestran como «<3». El formulario de reporte rechaza texto que parezca correo, teléfono o dirección.
7. **Señales:** suma de las últimas 2 semanas ≥ 1.5 × (promedio de las 8 semanas previas × 2) y al menos 10 registros (`src/utils/signals.ts`). Siempre con el texto: «Esta señal indica que un dato cambió respecto a su línea base; no es un diagnóstico ni la confirmación de un brote».
8. **Estado «verificado»** = «revisado como observación útil». La moderación (admin) permite aprobar, pedir ampliación o descartar con motivo; en reportes verificados, canalizar o cerrar. Si moderas un reporte creado en este navegador, el cambio aparece en «Mis reportes».
9. **Mapa base:** teselas raster públicas de OpenStreetMap (`https://tile.openstreetmap.org`, © colaboradores de OpenStreetMap, ODbL), desaturadas. Su política de uso admite tráfico moderado; para producción se recomienda un proveedor propio o con acuerdo de uso.
10. **Diseño:** sigue `DESIGN.md` (crema, bosque, salvia, pizarra; serif ligera para títulos, sans para UI; superficies planas, radio 14 px) como referencia visual, sin adoptar la marca Ease Health. Los colores de tipo de dato son una extensión funcional necesaria para distinguir capas.

## Accesibilidad

Etiquetas visibles y errores asociados con `aria-describedby`, foco visible, enlace «Saltar al contenido», foco al contenido principal al navegar, pestañas con flechas en Administración, objetivos táctiles ≥ 44 px, `prefers-reduced-motion`, tablas con encabezados y alternativa textual de gráficas y mapa. Ningún estado se comunica solo con color.

## Limitaciones

- Sin backend, API, autenticación ni integración con sistemas oficiales. Las guardas de rol no son seguridad.
- Datos, fuentes y brigadas inventados.
- Polígonos de zona ilustrativos, no límites legales.
- Las reglas de retención y eliminación de los módulos A/B están en texto; no hay servidor que las ejecute.
- El mapa base requiere Internet; el resto de la app no.
- Recharts y MapLibre se cargan en diferido, pero siguen siendo los paquetes más pesados del build.
- Pendiente antes de producción: revisión con lector de pantalla, pruebas en varios navegadores y dispositivos reales, y dictamen jurídico de privacidad.

## Créditos

Prototipo Tucanthon 2026. Mapa base © colaboradores de OpenStreetMap. Las guías de `ai-skills/` conservan sus atribuciones originales.
