import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  PlusCircle,
  Route,
  BarChart3,
  Siren,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/report', label: 'New Report', icon: PlusCircle, exact: false },
  { href: '/routes', label: 'Safe Routes', icon: Route, exact: false },
  { href: '/patterns', label: 'Crime Patterns', icon: BarChart3, exact: false },
  { href: '/alerts', label: 'Alerts', icon: Siren, exact: false },
];
