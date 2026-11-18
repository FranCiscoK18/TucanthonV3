import { Ellipsis, LogIn, LogOut, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { NAV_GROUP_LABELS, mobileTabsFor, navItemsFor, type NavItem } from '../../app/navigation';
import { useSession } from '../../app/session';
import { roleLabels } from '../../config/roles';
import { cx } from '../../utils/cx';

/** Hoja «Más» con todos los módulos del rol (móvil). Usa `<dialog>` para atrapar el foco. */
function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { role, session, signOut } = useSession();
  const navigate = useNavigate();
  const items = navItemsFor(role);
  const groups = (['publico', 'cuenta', 'gestion'] as const)
    .map((group) => [group, items.filter((item) => item.group === group)] as const)
    .filter(([, list]) => list.length > 0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-label="Todas las secciones"
      className="mt-auto mb-0 max-h-[85dvh] w-full max-w-none rounded-t-[20px] bg-cream-paper p-0 text-charcoal backdrop:bg-forest-shadow/45 lg:hidden"
      onClick={(event) => {
        if (event.target === ref.current) ref.current?.close();
      }}
    >
      {open && (
        <div className="px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line/40" aria-hidden="true" />
          <div className="flex items-center justify-between">
            <p className="font-serif text-[1.375rem] text-forest-ink">Secciones</p>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="inline-flex size-11 items-center justify-center rounded-full text-forest-ink hover:bg-keylime-wash"
              aria-label="Cerrar"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Todas las secciones" className="mt-2">
            {groups.map(([group, list]) => (
              <div key={group} className="mb-4">
                <p className="mb-1 text-[0.8125rem] font-semibold text-muted">{NAV_GROUP_LABELS[group]}</p>
                <ul className="grid grid-cols-2 gap-1.5">
                  {list.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.area}>
                        <NavLink
                          to={item.to}
                          end={item.to === '/'}
                          onClick={() => ref.current?.close()}
                          className={({ isActive }) =>
                            cx(
                              'flex min-h-12 items-center gap-2.5 rounded-[12px] px-3 py-2 text-[0.9375rem]',
                              isActive ? 'bg-keylime-wash font-semibold text-forest-ink' : 'bg-border-mist/60 text-charcoal',
                            )
                          }
                        >
                          <Icon className="size-[1.125rem] shrink-0" aria-hidden="true" />
                          {item.label}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-[12px] bg-keylime-wash px-3 py-2.5">
            <p className="text-sm">
              <span className="text-muted">Perfil: </span>
              <span className="font-semibold text-forest-ink">{roleLabels[role]}</span>
            </p>
            {session ? (
              <button
                type="button"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-[10px] px-2 text-sm font-medium text-forest-ink"
                onClick={async () => {
                  ref.current?.close();
                  await signOut();
                  navigate('/', { replace: true });
                }}
              >
                <LogOut className="size-4" aria-hidden="true" /> Salir
              </button>
            ) : (
              <Link
                to="/acceso"
                onClick={() => ref.current?.close()}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-[10px] px-2 text-sm font-medium text-forest-ink"
              >
                <LogIn className="size-4" aria-hidden="true" /> Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

function TabLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        cx(
          'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[0.75rem] leading-tight',
          isActive ? 'font-semibold text-forest-ink' : 'text-muted',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cx('absolute inset-x-4 top-0 h-[3px] rounded-b-full', isActive ? 'bg-forest-ink' : 'bg-transparent')}
            aria-hidden="true"
          />
          <Icon className="size-5" aria-hidden="true" />
          <span className="max-w-full truncate">{item.shortLabel}</span>
        </>
      )}
    </NavLink>
  );
}

/** Pestañas inferiores para móvil y tableta. */
export function BottomTabs() {
  const { role } = useSession();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const tabs = mobileTabsFor(role);
  const inTabs = tabs.some((tab) => (tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to)));

  return (
    <>
      <nav
        aria-label="Navegación inferior"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border-mist bg-cream-paper pb-safe lg:hidden"
      >
        <ul className="mx-auto flex max-w-xl">
          {tabs.map((item) => (
            <li key={item.area} className="flex flex-1">
              <TabLink item={item} />
            </li>
          ))}
          <li className="flex flex-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={cx(
                'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[0.75rem] leading-tight',
                !inTabs ? 'font-semibold text-forest-ink' : 'text-muted',
              )}
            >
              <span
                className={cx('absolute inset-x-4 top-0 h-[3px] rounded-b-full', !inTabs ? 'bg-forest-ink' : 'bg-transparent')}
                aria-hidden="true"
              />
              <Ellipsis className="size-5" aria-hidden="true" />
              Más
            </button>
          </li>
        </ul>
      </nav>
      <MoreSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
