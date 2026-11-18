import {
  Building2,
  ClipboardList,
  Home,
  Map,
  Megaphone,
  Scale,
  Settings2,
  Syringe,
  Activity,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../types';
import { ROUTE_ACCESS, canAccess, type Access } from './access';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  access: Access;
  group: 'publico' | 'personal' | 'gestion';
  /** Prioridad para las pestañas inferiores en móvil (menor = antes). */
  mobilePriority?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, access: 'publico', group: 'publico', mobilePriority: 1 },
  { to: '/como-funciona', label: 'Cómo funciona', icon: Workflow, access: 'publico', group: 'publico' },
  { to: '/mapa', label: 'Mapa', icon: Map, access: 'publico', group: 'publico', mobilePriority: 2 },
  { to: '/enfermedades', label: 'Enfermedades y señales', icon: Activity, access: 'publico', group: 'publico' },
  { to: '/brigadas', label: 'Brigadas y campañas', icon: Syringe, access: 'publico', group: 'publico' },
  { to: '/reportes', label: 'Reportar', icon: Megaphone, access: 'publico', group: 'publico', mobilePriority: 3 },
  { to: '/normativa', label: 'Normativa y fuentes', icon: Scale, access: 'publico', group: 'publico' },
  { to: '/reportes/mios', label: 'Mis reportes', icon: ClipboardList, access: [...ROUTE_ACCESS.misReportes], group: 'personal' },
  { to: '/institucion', label: 'Panel institucional', icon: Building2, access: [...ROUTE_ACCESS.institucion], group: 'gestion', mobilePriority: 4 },
  { to: '/administracion', label: 'Administración', icon: Settings2, access: [...ROUTE_ACCESS.admin], group: 'gestion' },
];

export const NAV_GROUP_LABELS: Record<NavItem['group'], string> = {
  publico: 'Información pública',
  personal: 'Mi espacio',
  gestion: 'Gestión',
};

/** Un rol no ve en el menú módulos fuera de su acceso. */
export function navFor(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => canAccess(role, item.access));
}

/** Cuatro accesos principales para la barra inferior móvil (+ "Más"). */
export function mobileTabsFor(role: UserRole): NavItem[] {
  return navFor(role)
    .filter((i) => i.mobilePriority !== undefined)
    .sort((a, b) => (a.mobilePriority ?? 99) - (b.mobilePriority ?? 99))
    .slice(0, 4);
}

