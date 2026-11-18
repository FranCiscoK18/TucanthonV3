import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { mobileTabsFor, navFor } from '../../app/navigation';
import { useSession } from '../../app/SessionContext';
import { NavList } from './SideNav';

/** Pestañas inferiores (móvil y tableta) + hoja "Más" con el resto del menú. */
export function BottomTabs() {
  const { role } = useSession();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tabs = mobileTabsFor(role);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheetRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      {/* Espaciador para que el contenido no quede bajo la barra */}
      <div className="h-[72px] lg:hidden" aria-hidden />
      <nav aria-label="Navegación rápida" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-cream lg:hidden">
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {tabs.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.to === '/' || tab.to === '/reportes'}
                className={({ isActive }) =>
                  `flex h-16 flex-col items-center justify-center gap-1 text-[11.5px] ${isActive ? 'font-semibold text-forest' : 'text-muted'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`grid h-7 w-12 place-items-center rounded-full ${isActive ? 'bg-keylime' : ''}`}>
                      <tab.icon aria-hidden className="h-5 w-5" />
                    </span>
                    <span className="max-w-full truncate px-1">{tab.label.split(' ')[0]}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={open}
              aria-controls="menu-mas"
              onClick={() => setOpen(true)}
              className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11.5px] text-muted"
            >
              <span className="grid h-7 w-12 place-items-center rounded-full">
                <Menu aria-hidden className="h-5 w-5" />
              </span>
              Más
            </button>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div
            id="menu-mas"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú completo"
            className="pb-safe absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[20px] bg-cream px-4 pt-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="title-display text-2xl">Menú</p>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                <X aria-hidden className="h-4 w-4" />
                Cerrar
              </button>
            </div>
            <NavList items={navFor(role)} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
