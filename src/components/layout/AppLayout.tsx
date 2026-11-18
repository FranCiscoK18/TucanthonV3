import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../ui/Feedback';
import { BottomTabs } from './BottomTabs';
import { Footer } from './Footer';
import { Header } from './Header';
import { SideNav } from './SideNav';

export function AppLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Al navegar: subir al inicio y mover el foco al contenido principal (lectores de pantalla).
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-dvh bg-cream">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[10px] focus:bg-forest focus:px-4 focus:py-3 focus:text-cream"
      >
        Saltar al contenido
      </a>
      <Header />
      <div className="mx-auto flex w-full max-w-[1440px]">
        <SideNav />
        <div className="min-w-0 flex-1">
          <main id="contenido" ref={mainRef} tabIndex={-1} className="container-page py-8 outline-none md:py-12">
            <Suspense fallback={<LoadingState />}>
              <Outlet />
            </Suspense>
          </main>
          <Footer />
        </div>
      </div>
      <BottomTabs />
    </div>
  );
}
