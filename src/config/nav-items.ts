import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  PlusCircle,
  Route,
  BarChart3,
  Siren,
  FilePenLine,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const navItems: NavItem[] = [
  { href: '/', label: 'Panel', icon: LayoutDashboard, exact: true },
  { href: '/report', label: 'Nuevo Reporte', icon: PlusCircle, exact: false },
  { href: '/routes', label: 'Rutas Seguras', icon: Route, exact: false },
  { href: '/patterns', label: 'Patrones', icon: BarChart3, exact: false },
  { href: '/alerts', label: 'Alertas', icon: Siren, exact: false },
  { href: '/routes-draft', label: 'Rutas (Borrador)', icon: FilePenLine, exact: false },
];
