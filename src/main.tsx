import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { router } from './app/router';
import { SessionProvider } from './app/session';
import { initServiceConfigFromUrl } from './services/config';
import './index.css';

initServiceConfigFromUrl(window.location.search);

const container = document.getElementById('root');
if (!container) throw new Error('No se encontró el contenedor #root.');

createRoot(container).render(
  <StrictMode>
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  </StrictMode>,
);
