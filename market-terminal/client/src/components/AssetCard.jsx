import Sparkline from './Sparkline';
import { useSparkline } from '../hooks/useMarketData';
import useStore from '../store/useStore';

export default function AssetCard({ symbol, name, quote, onClick, compact = false }) {
  const timeRange = useStore((s) => s.timeRange);
  const { data: sparkData } = useSparkline(symbol, timeRange === '1d' ? '1d' : '1w');

  if (!quote) {
    return (
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
        <div className="skeleton h-4 w-20 mb-2" />
        <div className="skeleton h-6 w-28 mb-1" />
        <div className="skeleton h-4 w-24 mb-2" />
        <div className="skeleton h-8 w-full" />
      </div>
    );
  }

  const price = quote.regularMarketPrice;
  const change = quote.regularMarketChange;
  const changePct = quote.regularMarketChangePercent;
  const isUp = change >= 0;
  const high52 = quote.fiftyTwoWeekHigh;
  const low52 = quote.fiftyTwoWeekLow;
  const rangePercent = high52 && low52 ? ((price - low52) / (high52 - low52)) * 100 : 50;

  return (
    <div
      onClick={onClick}
      className="bg-terminal-card border border-terminal-border rounded-lg p-4 hover:border-terminal-accent cursor-pointer transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-mono text-sm font-semibold text-terminal-text">{symbol}</h3>
          <p className="text-xs text-terminal-text-secondary truncate max-w-[150px]">{name}</p>
        </div>
        <Sparkline data={sparkData || []} width={80} height={32} />
      </div>

      <div className="font-mono text-xl font-bold text-terminal-text mb-1">
        {typeof price === 'number' ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
      </div>

      <div className={`font-mono text-sm font-medium mb-3 ${isUp ? 'text-terminal-green' : 'text-terminal-red'}`}>
        {isUp ? '+' : ''}{change?.toFixed(2)} ({isUp ? '+' : ''}{changePct?.toFixed(2)}%)
      </div>

      {!compact && high52 && low52 && (
        <div>
          <div className="flex justify-between text-[10px] text-terminal-text-secondary font-mono mb-1">
            <span>{low52.toFixed(2)}</span>
            <span className="text-terminal-text-secondary">52W Range</span>
            <span>{high52.toFixed(2)}</span>
          </div>
          <div className="h-1.5 bg-terminal-border rounded-full overflow-hidden">
            <div
              className="h-full bg-terminal-accent rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, rangePercent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
