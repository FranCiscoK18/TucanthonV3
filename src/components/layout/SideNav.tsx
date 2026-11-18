import { NavLink } from 'react-router-dom';
import { NAV_GROUP_LABELS, navFor, type NavItem } from '../../app/navigation';
import { useSession } from '../../app/SessionContext';

export function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const groups = (['publico', 'personal', 'gestion'] as const)
    .map((g) => ({ group: g, items: items.filter((i) => i.group === g) }))
    .filter((g) => g.items.length > 0);
  return (
    <>
      {groups.map(({ group, items: groupItems }) => (
        <div key={group} className="mb-6">
          <p className="eyebrow mb-2 px-3 text-muted">{NAV_GROUP_LABELS[group]}</p>
          <ul className="space-y-0.5">
            {groupItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/' || item.to === '/reportes'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex min-h-[44px] items-center gap-3 rounded-[7px] px-3 py-2 text-[15px] transition-colors ${
                      isActive ? 'bg-keylime font-medium text-forest' : 'text-ink hover:bg-paper'
                    }`
                  }
                >
                  <item.icon aria-hidden className="h-[18px] w-[18px] shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

/** Navegación lateral (escritorio). */
export function SideNav() {
  const { role } = useSession();
  return (
    <nav aria-label="Navegación principal" className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-hairline px-3 py-6 lg:block">
      <NavList items={navFor(role)} />
    </nav>
  );
}
