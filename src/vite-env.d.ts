/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Tasa de error simulada (0 a 1) para probar estados de error. DEMO. */
  readonly VITE_DEMO_ERROR_RATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
