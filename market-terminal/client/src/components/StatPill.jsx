import Sparkline from './Sparkline';
import { useSparkline } from '../hooks/useMarketData';
import useStore from '../store/useStore';

export default function StatPill({ symbol, name, quote, onClick }) {
  const timeRange = useStore((s) => s.timeRange);
  const rangeMap = { '1d': '1d', '1w': '1w', '1m': '1m', '3m': '3m', 'ytd': 'ytd', '1y': '1y', '5y': '5y' };
  const { data: sparkData } = useSparkline(symbol, rangeMap[timeRange] || '1w');

  if (!quote) {
    return (
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-3 min-w-[180px]">
        <div className="skeleton h-4 w-16 mb-2" />
        <div className="skeleton h-6 w-24 mb-1" />
        <div className="skeleton h-4 w-20" />
      </div>
    );
  }

  const price = quote.regularMarketPrice;
  const change = quote.regularMarketChange;
  const changePct = quote.regularMarketChangePercent;
  const isUp = change >= 0;

  return (
    <div
      onClick={onClick}
      className="bg-terminal-card border border-terminal-border rounded-lg p-3 min-w-[180px] hover:border-terminal-accent cursor-pointer transition-all"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-terminal-text-secondary text-xs font-mono uppercase tracking-wider">
          {name || symbol}
        </span>
        <Sparkline data={sparkData || []} width={60} height={24} />
      </div>
      <div className="font-mono text-lg font-semibold text-terminal-text">
        {typeof price === 'number' ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
      </div>
      <div className={`font-mono text-sm ${isUp ? 'text-terminal-green' : 'text-terminal-red'}`}>
        {isUp ? '+' : ''}{change?.toFixed(2)} ({isUp ? '+' : ''}{changePct?.toFixed(2)}%)
      </div>
    </div>
  );
}
