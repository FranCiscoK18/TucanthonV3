# EpiRadar Cancún — Plataforma Integral de Inteligencia Epidemiológica, Prevención y Atención Médica

**DEMO 100 % FRONTEND.** React + TypeScript + Vite + Tailwind CSS v4 + React Router + MapLibre GL JS.

> ⚠️ **Todo el contenido sanitario es ficticio.** El proyecto no contiene registros epidemiológicos reales, sistemas clínicos, usuarios verificados, credenciales médicas válidas, campañas oficiales ni citas con profesionales de la salud. No diagnostica, no declara brotes y no sustituye a autoridades ni atención médica. Las ubicaciones son centroides ilustrativos, nunca domicilios de personas enfermas.

## Requisitos y ejecución

Node.js **20.19+ o 22+** y npm. Para ejecutar localmente:

```bash
npm install
npm run dev
```

Abrir la dirección local que muestre Vite (habitualmente `http://localhost:5173`). Para comprobar el build de producción y los tipos:

```bash
npm run typecheck
npm run build
npm run preview
```

No se requieren variables de entorno, backend, credenciales, base de datos ni Docker. **El mapa sí necesita conexión a Internet para descargar los mosaicos base de OpenStreetMap**; los marcadores y capas de la app son locales y ficticios.

## Estructura

- `src/app/`: contexto de sesión mock, guardas de navegación y rutas.
- `src/components/layout/`: cabecera, navegación responsive y pie de página.
- `src/components/ui/`: estados de carga, error y vacío; badges DEMO, tarjetas, formularios.
- `src/components/maps/`: visualización MapLibre con cuatro capas GeoJSON independientes.
- `src/components/charts/`: gráfica SVG accesible sin librerías pesadas.
- `src/pages/`: nueve áreas del producto más login y perfil de médico.
- `src/types/models.ts`: `Disease`, `DiseaseCategory`, `Region`, `AggregatedCase`, `VectorRecord`, `VaccinationBrigade`, `Doctor`, `DoctorSchedule`, `Appointment`, `CitizenReport`, `Alert`, `DataSource`, `UserRole`, `AuditLog` y tipos auxiliares.
- `src/mocks/data.ts`: **única fuente central de escenarios inventados**, etiquetados en código y UI.
- `src/services/demoService.ts`: funciones `async` simuladas, latencia artificial y persistencia local limitada.
- `src/hooks/useDemoData.ts`: carga asíncrona, reintento, errores y cancelación de efectos desmontados.
- `src/utils/`: formatos y fechas.
- `src/index.css`: tokens de diseño y componentes básicos inspirados en `DESIGN.md`.

Los documentos `AGENTS.md`, `DESIGN.md` y `ai-skills/` preexistentes en el repositorio deben conservarse.

## Rutas y roles mock

| Ruta | Pantalla | Acceso DEMO |
|---|---|---|
| `/acceso` | Elegir rol | Todos |
| `/` | Inicio ciudadano | `ciudadano` |
| `/mapa` | Mapa epidemiológico | `ciudadano` |
| `/enfermedades` | Catálogo y filtros | `ciudadano` |
| `/enfermedades/:id` | Tendencia y criterios | `ciudadano` |
| `/brigadas` | Campañas y mapa | `ciudadano` |
| `/directorio` | Especialistas DEMO | `ciudadano` |
| `/medicos/:id` | Perfil del profesional | `ciudadano` |
| `/citas` | Agenda y reservas ficticias | `ciudadano` |
| `/reportes` | Registro de riesgo ambiental | `ciudadano` |
| `/medico` | Perfil y agenda del profesional DEMO 01 | `medico` |
| `/institucion` | Tablas, indicadores, CSV | `institucion`, `admin` |
| `/administracion` | Fuentes, moderación y bitácora | `admin` |

La selección de rol es únicamente una demostración de flujo visual: **no es autenticación ni autorización segura**. Las rutas restringidas son guards de frontend y se pueden eludir desde las herramientas de desarrollo del navegador; nunca usar en producción para datos sensibles.

## Modelo DEMO, filtros y límites

- **Epidemiología:** registros **institucionales ficticios DEMO** agregados por región, enfermedad, periodo y clasificación ficticia; nunca individualizados. No representan fuentes oficiales.
- **Entomología:** índices **estimados DEMO** arbitrarios; no miden presencia real de vectores ni implican riesgo sanitario individual.
- **Reportes ciudadanos:** triángulos y tablas separados de las capas clínicas; avisos ambientales **no verificados**, nunca casos.
- **Brigadas:** símbolos de cruz y fechas ficticias; **no acudir** a sedes señaladas.
- **Mapa:** OpenStreetMap como referencia geográfica general. Los puntos demográficos son centroides ilustrativos, no límites legales, sedes reales ni domicilios de pacientes. Debe tener acceso a Internet para mostrar el fondo cartográfico.
- **Enfermedades:** las alertas estadísticas se activan únicamente si el último valor DEMO es mayor que 135 % de la media de los tres anteriores y hay al menos 10 registros inventados. **No es una definición clínica de brote.**
- **Directorio:** nombres, credenciales `DEMO-000X`, precios y horarios son enteramente ficticios.
- **Exportación CSV:** genera un archivo de escenario ficticio con texto DEMO; no realiza peticiones de red.

## Persistencia y funcionamiento simulado

Solo se usan estas tres claves de `localStorage`:

| Clave | Contenido |
|---|---|
| `epiradar-demo-session` | Rol de la sesión sin seguridad real |
| `epiradar-demo-appointments` | Citas ficticias guardadas en este navegador |
| `epiradar-demo-reports` | Reportes ambientales propios guardados en este navegador |

La foto de un reporte **no se sube ni se guarda**; únicamente se conserva el **nombre del archivo** para demostrar el campo. No deben ingresarse datos personales reales. Estados de moderación de reportes de ejemplo, fuentes activadas y bitácora administrativa viven solo en memoria, y desaparecen al recargar. Ningún `fetch()` envía datos sanitarios a una API.

## Arquitectura y decisiones de UX

Los filtros funcionan sobre arrays locales con operaciones deterministas. El mapa tiene fuentes GeoJSON separadas por capa (`epidemiologia`, `entomologia`, `reportes`, `brigadas`) y controles de visibilidad individuales. Se utilizan símbolos, tamaños, colores, etiquetas y leyendas diferentes. Las actualizaciones de filtros reconstruyen fuentes locales sin refrescar toda la SPA.

El diseño replica los **principios**, no la marca, de `DESIGN.md`: crema, bosque, salvia y azul grisáceo; encabezados serif ligeros y UI sans; tarjetas planas sin sombras, radio de 14px y espaciado generoso. Se usan colores semánticos adicionales limitados en capas cartográficas para prevenir confusiones entre categorías.

Accesibilidad: etiquetas visibles, foco perceptible, navegación de teclado, enlaces para saltar al contenido, textos alternativos de la gráfica, objetivos táctiles cómodos y preferencias de movimiento reducido. **La revisión manual con lector de pantalla y pruebas cross-browser aún son necesarias antes de producción.**

## Lo que NO incluye

Sin backend, APIs de salud, autenticación, almacenamiento de fotos, geolocalización individual, datos oficiales, diagnóstico automatizado, integración con hospitales, notificaciones push, pagos, Docker o migraciones.

## Licencia y fuentes

Prototipo demostrativo de Tucanthon 2026. Créditos cartográficos © colaboradores de OpenStreetMap. Las guías de diseño originales del repositorio conservan sus atribuciones.