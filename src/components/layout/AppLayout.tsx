import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { BottomTabs } from './BottomTabs';
import { Footer } from './Footer';
import { Header } from './Header';
import { SideNav } from './SideNav';

/** Tras cada navegación, lleva el foco al título de la nueva vista (lectores de pantalla). */
function useFocusOnNavigate() {
  const location = useLocation();
  // Se compara con la ruta anterior (no con una bandera de «primer render»), porque en modo
  // estricto los efectos se ejecutan dos veces al montar.
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    if (location.hash) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>('main h1') ?? document.getElementById('contenido');
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);
}

export function AppLayout() {
  useFocusOnNavigate();
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-[10px] bg-forest-ink px-4 py-3 font-medium text-cream-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Saltar al contenido
      </a>
      <Header />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-8 px-4 sm:px-6 lg:px-8">
        <SideNav />
        <main id="contenido" tabIndex={-1} className="min-w-0 flex-1 py-7 outline-none lg:py-10">
          <Outlet />
        </main>
      </div>
      <Footer />
      <BottomTabs />
      <ScrollRestoration />
    </div>
  );
}
