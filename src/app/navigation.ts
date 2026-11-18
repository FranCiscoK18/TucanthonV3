/** Elementos de navegación. Un rol nunca ve en el menú módulos fuera de su acceso. */
import {
  BookOpenText,
  Building2,
  ClipboardList,
  House,
  Map as MapIcon,
  MessageSquarePlus,
  Scale,
  Settings2,
  Syringe,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../types';
import { canAccess, type AreaId } from './access';

export interface NavItem {
  area: AreaId;
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  group: 'publico' | 'cuenta' | 'gestion';
}

export const NAV_ITEMS: NavItem[] = [
  { area: 'inicio', to: '/inicio', label: 'Inicio', shortLabel: 'Inicio', icon: House, group: 'publico' },
  { area: 'mapa', to: '/mapa', label: 'Mapa epidemiológico', shortLabel: 'Mapa', icon: MapIcon, group: 'publico' },
  { area: 'enfermedades', to: '/enfermedades', label: 'Enfermedades y señales', shortLabel: 'Señales', icon: BookOpenText, group: 'publico' },
  { area: 'brigadas', to: '/brigadas', label: 'Brigadas y campañas', shortLabel: 'Brigadas', icon: Syringe, group: 'publico' },
  { area: 'reportar', to: '/reportar', label: 'Enviar un reporte', shortLabel: 'Reportar', icon: MessageSquarePlus, group: 'publico' },
  { area: 'normativa', to: '/normativa', label: 'Normativa y fuentes', shortLabel: 'Normativa', icon: Scale, group: 'publico' },
  { area: 'mis-reportes', to: '/mis-reportes', label: 'Mis reportes', shortLabel: 'Mis reportes', icon: ClipboardList, group: 'publico' },
  { area: 'institucion', to: '/institucion', label: 'Centro de vigilancia', shortLabel: 'Vigilancia', icon: Building2, group: 'gestion' },
  { area: 'administracion', to: '/administracion', label: 'Gestión de reportes', shortLabel: 'Reportes', icon: Settings2, group: 'gestion' },
];

export const NAV_GROUP_LABELS: Record<NavItem['group'], string> = {
  publico: 'Información pública',
  cuenta: 'Seguimiento en este navegador',
  gestion: 'Gestión',
};

export function navItemsFor(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => canAccess(role, item.area));
}

/** Pestañas inferiores en móvil (máximo 4 + «Más»), priorizadas por rol. */
const TAB_PRIORITY: Record<UserRole, AreaId[]> = {
  invitado: ['inicio', 'mapa', 'reportar', 'brigadas'],
  admin: ['inicio', 'institucion', 'administracion', 'mapa'],
};

export function mobileTabsFor(role: UserRole): NavItem[] {
  return TAB_PRIORITY[role]
    .map((area) => NAV_ITEMS.find((item) => item.area === area))
    .filter((item): item is NavItem => item !== undefined && canAccess(role, item.area));
}
