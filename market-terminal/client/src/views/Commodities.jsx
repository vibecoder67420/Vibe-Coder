import { useQuotes, useSparkline } from '../hooks/useMarketData';
import { COMMODITIES } from '../data/tickers';
import useStore from '../store/useStore';
import Sparkline from '../components/Sparkline';
import { useNavigate } from 'react-router-dom';

function CommodityRow({ name, symbol, quote, onClick }) {
  const { data: sparkData } = useSparkline(symbol, '1m');
  const pct = quote?.regularMarketChangePercent || 0;
  const isUp = pct >= 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between py-3 px-3 rounded hover:bg-terminal-surface cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        <div>
          <span className="text-sm font-medium text-terminal-text">{name}</span>
          <span className="text-xs font-mono text-terminal-text-secondary ml-2">{symbol}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Sparkline data={sparkData || []} width={60} height={24} />
        <span className="font-mono text-sm text-terminal-text w-20 text-right">
          ${quote?.regularMarketPrice?.toFixed(2) || '—'}
        </span>
        <span className={`font-mono text-xs w-16 text-right ${isUp ? 'text-terminal-green' : 'text-terminal-red'}`}>
          {isUp ? '+' : ''}{pct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export default function CommoditiesPage() {
  const openModal = useStore((s) => s.openModal);
  const navigate = useNavigate();

  const allSymbols = Object.values(COMMODITIES).flat().map((c) => c.symbol);
  const { data: quotes } = useQuotes(allSymbols);

  return (
    <div className="space-y-6">
      <h1 className="text-sm font-mono text-terminal-accent uppercase tracking-wider">Commodities</h1>

      {Object.entries(COMMODITIES).map(([category, items]) => (
        <div key={category} className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <h3 className="text-xs font-mono text-terminal-accent uppercase tracking-wider mb-2">{category}</h3>
          <div className="divide-y divide-terminal-border">
            {items.map(({ name, symbol }) => (
              <CommodityRow
                key={symbol}
                name={name}
                symbol={symbol}
                quote={quotes?.[symbol]}
                onClick={() => openModal(symbol)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
        <h3 className="text-xs font-mono text-terminal-energy uppercase tracking-wider mb-2">Energy Commodities</h3>
        <button
          onClick={() => navigate('/energy')}
          className="text-xs font-mono text-terminal-accent hover:underline"
        >
          View detailed Energy page →
        </button>
      </div>
    </div>
  );
}
