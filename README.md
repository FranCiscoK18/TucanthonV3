# Ondara Cancún · Frontend DEMO

**Plataforma de Inteligencia Epidemiológica Participativa.** Prototipo de frontend con datos simulados, para validación.

> **Ondara complementa, no sustituye, a las autoridades sanitarias. No diagnostica ni confirma casos. Información DEMO para validación.**
>
> Todo el contenido es ficticio y lleva la etiqueta **DEMO**: series epidemiológicas, zonas, reportes, brigadas y operación del piloto. No hay backend, base de datos, autenticación real ni integración con sistemas oficiales.

Stack: React 19 · TypeScript 5.9 (estricto, sin `any`) · Vite 7 · Tailwind CSS 4 · React Router 7 · MapLibre GL JS 6 · gráficas SVG propias.

---

## 1. Instalación y ejecución

Requisitos: **Node.js 20.19+ o 22.12+** y npm.

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite (normalmente `http://localhost:5173`). Para probar en un teléfono de la misma red: `npm run dev -- --host`.

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run typecheck` | Verificación de tipos (app y configuración) |
| `npm run build` | Verificación de tipos y build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |

No se necesitan variables de entorno. **El mapa base requiere internet** (OpenFreeMap). Sin conexión, el mapa usa una costa esquemática local y las capas DEMO funcionan igual.

Parámetros útiles:

- `?modo-prueba=1` activa el **modo prueba de fallos**: alrededor del 35 % de las llamadas simuladas fallan, para revisar los estados de error. También se activa desde el pie de página.
- **Borrar datos locales de la DEMO** (pie de página) elimina la sesión, los reportes y la bitácora guardados en el navegador.

## 2. Estructura

```
src/
  app/            Rutas, sesión mock, matriz de acceso por rol, navegación y RequireArea
  components/
    layout/       Header, SideNav (escritorio), BottomTabs + hoja «Más» (móvil), Footer con aviso permanente
    ui/           Botones, insignias de tipo de dato, avisos, estados de carga/vacío/error,
                  formularios accesibles, diálogo, MetaItem, SourceMeta, SignalBadge
    charts/       TrendChart (tendencia con línea base, umbral y ventana), BarList, Sparkline
    map/          OndaraMap (MapLibre, carga diferida), MapLegend, ZoneDetail, estilos base y respaldo
    reports/      Estados del reporte, guía de estados y línea de tiempo
  config/         demo.ts (umbrales, privacidad, almacenamiento), texts.ts (textos obligatorios),
                  dataKinds.ts y mapLayers.ts (sistema visual), roles.ts
  hooks/          useAsync, useDocumentTitle, useElementWidth, useMediaQuery
  mocks/          Datos deterministas, todos con isDemo: true
  services/       Servicios simulados (config.ts: ÚNICO punto de latencia y tasa de error)
  types/          Tipos del dominio, exportados desde src/types/index.ts
  utils/          Fechas y semanas epidemiológicas, PRNG con semilla, folios, privacidad, señales, CSV
  pages/          Una vista por sección
public/brand/     Logotipo e isotipo de Ondara (PNG con fondo transparente)
```

`AGENTS.md`, `DESIGN.md` y `ai-skills/` se conservan sin cambios.

## 3. Rutas

| Ruta | Vista | Acceso |
|---|---|---|
| `/` | Inicio: qué es y qué no es, resumen de señales, accesos rápidos y avisos informativos | Público |
| `/como-funciona` | Seis etapas con responsable, regla de integridad, canales, modelo de servicio y piloto | Público |
| `/mapa` | Mapa con seis capas separadas, filtros, panel de zona y tabla | Público |
| `/enfermedades` | Catálogo, criterios de señal y señales activas | Público |
| `/enfermedades/:id` | Tendencia, señal, comparación de periodos, datos por semana y zona, vigilancia vectorial | Público |
| `/brigadas` y `/brigadas/:id` | Brigadas y campañas en lista y mapa, con detalle | Público |
| `/reportar` | Formulario de reporte sin datos personales; folio al enviar | Público |
| `/normativa` | Marcos a revisar y fuentes de datos DEMO | Público |
| `/acceso` | Selector de rol (login mock) | Público |
| `/mis-reportes` | Seguimiento de reportes propios (el admin puede abrirla, pero no aparece en su menú) | `ciudadano`, `admin` |
| `/institucion` | Centro de vigilancia epidemiológica (señales, zonas y métricas) | `admin` |
| `/administracion` | Fuentes, moderación, bitácora y separación de módulos | `admin` |

Sin sesión, una ruta protegida redirige a `/acceso?siguiente=…` y vuelve a la ruta pedida al elegir un rol válido. Con un rol sin permiso, muestra «Sin permiso». El menú lateral y las pestañas móviles solo muestran lo que el rol puede abrir.

## 4. Roles mock

| Rol | Acceso | Alias en pantalla |
|---|---|---|
| invitado (sin sesión) | Inicio, cómo funciona, mapa, enfermedades, brigadas, normativa. Puede enviar reportes. | — |
| ciudadano | Todo lo anterior, más seguimiento de reportes propios | Ciudadanía DEMO |
| admin | Centro de vigilancia, reportes, moderación, fuentes y bitácora | Administrador de salud (DEMO) |

**No es autenticación ni autorización real.** Las restricciones existen solo en la interfaz y se pueden eludir desde el navegador.

## 5. Datos mock y servicios simulados

- **Deterministas.** Un generador con semilla (mulberry32) produce los mismos datos en cada carga. Cada registro lleva `isDemo: true`.
- **Reloj DEMO.** La fecha de corte es el último sábado de la última semana epidemiológica completa antes de hoy, con 16 semanas de historia. Los valores se indexan por posición, así que la demostración siempre luce vigente sin depender de fechas fijas. Las brigadas se calculan desde hoy. Las horas se muestran en hora de Cancún (UTC−5).
- **Series diseñadas a mano** para ilustrar casos distintos: dengue con señal en la ciudad y en dos zonas, conteos estables, descensos y enfermedades con datos insuficientes.
- **Señal por incremento inusual (criterios visibles en la UI).** Compara las 2 semanas más recientes con el promedio de las 8 anteriores. Hay señal si la ventana suma al menos 1.5 veces lo esperado y tiene al menos 10 registros; con menos, «datos insuficientes».
- **Zonas** amplias (7) con polígonos ilustrativos hechos a mano. No son límites oficiales ni corresponden a domicilios. La población por zona es una estimación DEMO.
- **Privacidad en vistas públicas.** Los conteos ciudadanos menores a 3 se publican como «<3».
- **Reportes de ejemplo (~100)** con historiales coherentes. Las métricas de oportunidad y seguimiento se calculan con esas marcas de tiempo, no se inventan aparte.
- **Servicios** (`src/services`): funciones `async` con latencia de 300–800 ms y fallos opcionales en modo prueba. Latencia y tasa de error se configuran solo en `src/services/config.ts`.

### Persistencia: solo 3 claves de `localStorage`

| Clave | Contenido |
|---|---|
| `ondara.demo.sesion` | Rol de la sesión mock |
| `ondara.demo.reportes` | Reportes propios enviados desde este navegador |
| `ondara.demo.bitacora` | Bitácora de acciones institucionales (sin datos personales) |

La moderación de los reportes de ejemplo y el estado de las fuentes se **reconstruyen leyendo la bitácora**, así que no se necesitan más claves. En la DEMO todos los roles comparten el navegador: lo que moderes como `admin` se ve en «Mis reportes» como ciudadanía. Así se puede probar el ciclo completo.

## 6. Mapa

- **Estilo base:** [OpenFreeMap «Positron»](https://openfreemap.org) (`https://tiles.openfreemap.org/styles/positron`). Es un estilo vectorial libre, sin clave de API, con datos © colaboradores de OpenStreetMap (OpenMapTiles).
- **Respaldo local:** si el estilo o las teselas no cargan (sin conexión o red bloqueada), se usa una costa esquemática dibujada a mano. No necesita red ni glifos, y la UI avisa el cambio.
- **Seis capas separadas**, cada una con su interruptor, leyenda, color, icono y forma:

  | Capa | Tipo de dato | Símbolo |
  |---|---|---|
  | Datos oficiales DEMO | Oficial DEMO | Relleno verde secuencial por zona (0 + 5 clases) |
  | Indicadores estimados | Estimado | Ficha azul con borde punteado y «≈» (tasa por 10 mil hab., método explicado) |
  | Reportes ciudadanos sin verificar | Reporte ciudadano | Ficha terracota con conteo agregado (nunca puntos) |
  | Observaciones revisadas | Reporte ciudadano | Ficha ciruela con conteo |
  | Brigadas y campañas | Simulado | Marcador aqua (jeringa = brigada, megáfono = campaña) |
  | Vigilancia entomológica DEMO | Oficial DEMO | Ficha amarilla con % de ovitrampas positivas |

- La paleta de los marcadores (azul, terracota, ciruela, aqua y amarillo) se **validó con un script** de distinción para visión normal y daltonismo, comparando todos los pares. Aqua y amarillo tienen bajo contraste sobre crema, así que siempre llevan texto y hay una tabla gemela.
- Los marcadores son `<button>` con nombre accesible. También se puede elegir una zona con el filtro «Zona» o desde la tabla. MapLibre se carga bajo demanda (~300 kB gzip) solo en las vistas con mapa.

## 7. Diseño y accesibilidad

- Tokens de `DESIGN.md`: crema, tinta bosque, verde lima, menta, salvia y pizarra; superficies planas sin sombras; radio de 14 px; badges en píldora. Títulos en serif ligera (Fraunces, cuyos remates suaves recuerdan el logotipo) y texto en Inter. Ambas fuentes se sirven desde el propio proyecto, sin peticiones a terceros.
- Contraste AA verificado por cálculo para todos los pares texto/fondo definidos.
- Formularios con etiquetas visibles, ayudas y errores asociados (`aria-describedby`, `aria-invalid`) y resumen de errores enfocable. Foco visible y enlace «Saltar al contenido». El foco pasa al título de cada vista al navegar. Se respeta `prefers-reduced-motion`. Los botones principales miden 44 px de alto y todos los objetivos cumplen el mínimo de 24 px de WCAG 2.2, verificado con axe.
- Las gráficas tienen un solo eje, líneas de 2 px, cursor en cruz con tooltip (también con flechas del teclado) y siempre una tabla gemela.

## 8. Decisiones tomadas

1. **Sin directorio, citas ni perfil médico:** `main` retiró estas funciones (PR #3 y #4); esta versión tampoco las incluye.
2. **Se reemplazó el prototipo anterior** («EpiRadar Cancún», commit `74478ef`): no tenía acceso público ni las seis capas, y sus roles y estados no coincidían con el nuevo alcance.
3. **Versiones estables** de cada librería. MapLibre se usa en la línea 6 porque las versiones 6.4 y anteriores tienen un aviso crítico de seguridad (XSS en `DOM.sanitize`).
4. **Gráficas SVG propias** en lugar de Recharts, para no sumar peso.
5. **Paleta extendida:** `DESIGN.md` pide no añadir colores, pero distinguir tipos de dato es un requisito del producto. Se añadieron tonos validados solo para tipos de dato y capas.
6. **Sin mayúsculas sostenidas:** las etiquetas superiores van en tipo oración, en lugar de las mayúsculas que sugiere `DESIGN.md`.
7. **Reportes sin datos personales:** no se piden nombre, teléfono, correo ni domicilio, y se detectan teléfonos, correos, direcciones y CURP en el texto libre. La foto es simulada (no se sube ninguna imagen) y WhatsApp no se ofrece como canal.
8. **«Avisos informativos»** en lugar de «alertas», para evitar lenguaje de alarma. El tipo de datos sigue siendo `Alert`.
9. **Regla operativa DEMO:** sin ampliación en 15 días, el reporte se cierra por información insuficiente. La cola de moderación muestra primero los pendientes y permite buscar por folio.
10. **Bitácora:** solo registra roles institucionales; la actividad de la ciudadanía no se registra.
11. **Brigadas en pantallas angostas:** inician ocultas en el mapa para que los marcadores no se encimen. En `/brigadas` móvil, el mapa se carga al elegir la vista «Mapa».

## 9. Limitaciones y pendientes

- **Documento conceptual no disponible.** No se tuvo acceso a la propuesta conceptual (noviembre 2026), ni en el repositorio ni en Drive. Los textos se basan en lo que cita el encargo. Las **«cinco preguntas» del piloto son provisionales** (`provisional: true` en `src/mocks/pilot.ts`, señalado en la UI) y deben sustituirse por las del documento. Lo mismo aplica a las reglas de retención (90 días) y a las metas de los indicadores.
- **Geografía aproximada:** los polígonos de las zonas y la costa de respaldo son ilustrativos.
- **Seguridad:** no hay autenticación real; la DEMO no debe usarse con datos reales.
- **`npm audit`** reporta `picomatch` (ReDoS) en las herramientas de build (Vite, tinyglobby). No hay versión corregida y no se incluye en el bundle de la aplicación.
- **Pruebas manuales pendientes:** lectores de pantalla (NVDA, VoiceOver), Firefox y Safari, dispositivos reales, y el mapa base remoto con conexión (en el entorno de desarrollo la red de teselas estaba bloqueada; se validó el respaldo local).

## 10. Verificaciones ejecutadas

- `npm install`, `npm run typecheck` y `npm run build`, sin errores.
- `npm run dev` y `vite preview` recorridos con Playwright (Chromium headless) a 390 px y 1440 px: todas las rutas públicas, rutas protegidas como invitado (redirección) y cada rol (acceso y «Sin permiso»). Sin errores de consola ni desbordes horizontales. Los únicos avisos fueron del controlador WebGL por software del navegador headless («GPU stall due to ReadPixels») y las peticiones bloqueadas al mapa base.
- Flujos de punta a punta:
  - reporte como invitado (con validación de teléfono) → «Mis reportes» → ampliación pedida y respondida → aprobación, canalización y cierre, con bitácora;
  - exportación CSV solo con agregados;
  - modo prueba con «Reintentar».
- Mapa: las seis capas se activan y desactivan por separado, y la selección de zona funciona desde el filtro y desde las fichas.
- axe-core 4.14 (WCAG 2.2 AA y buenas prácticas) en 19 vistas a 390 px y 1280 px: **sin violaciones** tras corregir las que encontró (listas de definición mal formadas, orden de encabezados, contraste de pasos inactivos y marcadores encimados).
- Búsqueda en el código de `any` y de lenguaje de brote o diagnóstico: sin `any`; «brote» y «caso» solo aparecen en avisos negativos obligatorios.
