import { MessageSquarePlus } from 'lucide-react';
import { NavLink } from 'react-router';
import { NAV_GROUP_LABELS, navItemsFor, type NavItem } from '../../app/navigation';
import { useSession } from '../../app/session';
import { cx } from '../../utils/cx';
import { ButtonLink } from '../ui/Button';

function groupItems(items: NavItem[]): Array<[NavItem['group'], NavItem[]]> {
  const groups: Array<[NavItem['group'], NavItem[]]> = [];
  for (const item of items) {
    const existing = groups.find(([group]) => group === item.group);
    if (existing) existing[1].push(item);
    else groups.push([item.group, [item]]);
  }
  return groups;
}

/** Navegación lateral (escritorio). Solo muestra los módulos permitidos para el rol actual. */
export function SideNav() {
  const { role } = useSession();
  const groups = groupItems(navItemsFor(role));
  return (
    <nav aria-label="Navegación principal" className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 overflow-y-auto py-8 pr-2 lg:block">
      {groups.map(([group, items]) => (
        <div key={group} className="mb-6">
          <p className="mb-2 px-3 text-[0.8125rem] font-semibold text-muted">{NAV_GROUP_LABELS[group]}</p>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.area}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cx(
                        'flex min-h-11 items-center gap-3 rounded-nav px-3 py-2 text-[0.9375rem] transition-colors',
                        isActive ? 'bg-keylime-wash font-semibold text-forest-ink' : 'text-charcoal hover:bg-border-mist',
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
      <div className="rounded-card bg-mint-veil p-4">
        <p className="text-sm font-semibold text-forest-ink">¿Viste un posible criadero?</p>
        <p className="mt-1 text-sm text-muted">Envíalo sin cuenta y sin datos personales.</p>
        <ButtonLink to="/reportar" size="sm" icon={MessageSquarePlus} className="mt-3 w-full">
          Reportar
        </ButtonLink>
      </div>
    </nav>
  );
}
