import { Sun, Moon, Clock, PanelLeftClose, PanelLeft } from 'lucide-react';
import useStore from '../store/useStore';
import { useEffect, useState } from 'react';

const TIME_RANGES = ['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y'];

function getMarketStatus() {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const hours = et.getHours();
  const minutes = et.getMinutes();
  const day = et.getDay();
  const time = hours * 60 + minutes;

  if (day === 0 || day === 6) return { status: 'closed', label: 'Market Closed', color: 'text-terminal-red' };
  if (time >= 570 && time < 960) return { status: 'open', label: 'Market Open', color: 'text-terminal-green' };
  if (time >= 240 && time < 570) return { status: 'pre', label: 'Pre-Market', color: 'text-terminal-energy' };
  if (time >= 960 && time < 1200) return { status: 'after', label: 'After Hours', color: 'text-terminal-energy' };
  return { status: 'closed', label: 'Market Closed', color: 'text-terminal-red' };
}

export default function TopBar() {
  const { theme, toggleTheme, timeRange, setTimeRange, sidebarCollapsed, toggleSidebar } = useStore();
  const [etTime, setEtTime] = useState('');
  const [marketStatus, setMarketStatus] = useState(getMarketStatus());

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setEtTime(now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setMarketStatus(getMarketStatus());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 bg-terminal-surface border-b border-terminal-border flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-1 rounded hover:bg-terminal-card text-terminal-text-secondary hover:text-terminal-text">
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <span className="font-mono text-sm font-bold text-terminal-accent tracking-wider">THE TERMINAL</span>
        <div className={`flex items-center gap-1.5 ml-4 text-xs font-mono ${marketStatus.color}`}>
          <span className="inline-block w-2 h-2 rounded-full bg-current" />
          {marketStatus.label}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Time range */}
        <div className="flex items-center bg-terminal-card rounded-md border border-terminal-border overflow-hidden">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r.toLowerCase())}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium transition-colors ${
                timeRange === r.toLowerCase()
                  ? 'bg-terminal-accent text-white'
                  : 'text-terminal-text-secondary hover:text-terminal-text'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* ET time */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-terminal-text-secondary">
          <Clock size={12} />
          <span>{etTime} ET</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded hover:bg-terminal-card text-terminal-text-secondary hover:text-terminal-text"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
