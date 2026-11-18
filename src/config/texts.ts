/**
 * Textos obligatorios de integridad y limitación. Se centralizan para que
 * aparezcan siempre con la misma redacción en toda la interfaz.
 */
export const TEXTS = {
  footerNotice:
    'Ondara complementa, no sustituye, a las autoridades sanitarias. No diagnostica ni confirma casos. Información DEMO para validación.',
  integrityRule: 'Un reporte ciudadano es una observación, no un caso clínico confirmado.',
  signalDisclaimer:
    'Esta señal indica que un dato cambió respecto a su línea base; no es un diagnóstico ni la confirmación de un brote.',
  reportNotice:
    'Un reporte ciudadano no es un diagnóstico ni un caso confirmado. Su envío no garantiza una acción de la autoridad.',
  directoryNotice: 'Directorio informativo. Ondara no cobra comisiones ni recibe pagos por referencias.',
  regulationsNotice: 'Este apartado no sustituye un dictamen jurídico ni autoriza recopilar datos sensibles.',
  participationCaveat:
    'Una mayor cantidad de reportes puede reflejar más participación, no necesariamente más riesgo sanitario.',
  priorityCaveat:
    'La prioridad la define la autoridad sanitaria, no la plataforma. Esta lista es solo un insumo para su revisión.',
  noCausality:
    'Ninguna métrica de este panel demuestra que la plataforma haya causado cambios en la salud de la población, ni equivale a incidencia clínica.',
  emergency: 'Si alguien presenta signos de alarma, busca atención médica de inmediato o llama al 911.',
  noPersonalData: 'No incluyas nombres, teléfonos, correos, domicilios ni datos que identifiquen a alguna persona.',
  demoData: 'Datos simulados (DEMO). No provienen de ninguna autoridad ni sistema oficial.',
} as const;
