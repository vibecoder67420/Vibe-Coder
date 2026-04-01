import { useState } from 'react';
import { useQuotes } from '../hooks/useMarketData';
import AssetCard from '../components/AssetCard';
import { US_INDICES, INTL_INDICES, VOLATILITY } from '../data/tickers';
import useStore from '../store/useStore';

const TABS = ['US', 'International', 'Volatility'];

export default function Indices() {
  const [tab, setTab] = useState('US');
  const openModal = useStore((s) => s.openModal);

  const allSymbols = [...US_INDICES, ...INTL_INDICES, ...VOLATILITY].map((i) => i.symbol);
  const { data: quotes } = useQuotes(allSymbols);

  const currentList =
    tab === 'US' ? US_INDICES :
    tab === 'International' ? INTL_INDICES :
    VOLATILITY;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-mono text-terminal-accent uppercase tracking-wider">Global Indices</h1>
        <div className="flex items-center bg-terminal-card rounded-md border border-terminal-border overflow-hidden">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors ${
                tab === t
                  ? 'bg-terminal-accent text-white'
                  : 'text-terminal-text-secondary hover:text-terminal-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {currentList.map(({ name, symbol }) => (
          <AssetCard
            key={symbol}
            symbol={symbol}
            name={name}
            quote={quotes?.[symbol]}
            onClick={() => openModal(symbol)}
          />
        ))}
      </div>

      {tab === 'Volatility' && (
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-terminal-text-secondary">MOVE Index (Bond Volatility)</span>
            <span className="text-xs font-mono text-terminal-text-secondary bg-terminal-surface px-2 py-0.5 rounded">
              ICE BofA MOVE — External data source
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
