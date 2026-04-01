import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Grid3X3, BarChart3, PieChart, Zap,
  Gem, DollarSign, Bitcoin, TableProperties
} from 'lucide-react';
import useStore from '../store/useStore';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/heatmap', label: 'Heatmap', icon: Grid3X3 },
  { path: '/indices', label: 'Indices', icon: BarChart3 },
  { path: '/sectors', label: 'Sectors', icon: PieChart },
  { path: '/energy', label: 'Energy', icon: Zap },
  { path: '/commodities', label: 'Commodities', icon: Gem },
  { path: '/fx-rates', label: 'FX & Rates', icon: DollarSign },
  { path: '/crypto', label: 'Crypto', icon: Bitcoin },
  { path: '/screener', label: 'Screener', icon: TableProperties },
];

export default function Sidebar() {
  const collapsed = useStore((s) => s.sidebarCollapsed);

  return (
    <aside
      className={`h-full bg-terminal-surface border-r border-terminal-border flex flex-col py-4 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-52'
      }`}
    >
      <nav className="flex-1 flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-terminal-accent/10 text-terminal-accent'
                  : 'text-terminal-text-secondary hover:text-terminal-text hover:bg-terminal-card'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
