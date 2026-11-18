import { useEffect } from 'react';
import { APP_NAME } from '../config/demo';

/** Título del documento por vista: «Mapa epidemiológico · Ondara Cancún (DEMO)». */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME} (DEMO)`;
  }, [title]);
}
