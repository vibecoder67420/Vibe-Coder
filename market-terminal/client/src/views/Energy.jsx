import { useState } from 'react';
import { useQuotes } from '../hooks/useMarketData';
import { ENERGY_EQUITIES, ENERGY_COMMODITIES } from '../data/tickers';
import useStore from '../store/useStore';
import Sparkline from '../components/Sparkline';
import { useSparkline } from '../hooks/useMarketData';

const TABS = ['Equities', 'Commodities'];

function EnergyEquityRow({ symbol, quote, onClick }) {
  const pct = quote?.regularMarketChangePercent || 0;
  const isUp = pct >= 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between py-2 px-3 rounded hover:bg-terminal-surface cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-semibold text-terminal-text w-14">{symbol}</span>
        <span className="text-xs text-terminal-text-secondary truncate max-w-[140px]">
          {quote?.shortName || quote?.longName || ''}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-terminal-text">
          ${quote?.regularMarketPrice?.toFixed(2) || '—'}
        </span>
        <span className={`font-mono text-xs font-medium w-16 text-right ${isUp ? 'text-terminal-green' : 'text-terminal-red'}`}>
          {isUp ? '+' : ''}{pct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export default function Energy() {
  const [tab, setTab] = useState('Equities');
  const openModal = useStore((s) => s.openModal);

  const allEquitySymbols = Object.values(ENERGY_EQUITIES).flat();
  const allCommoditySymbols = ENERGY_COMMODITIES.map((c) => c.symbol);
  const dashSymbols = ['CL=F', 'NG=F', 'XLE', 'XOP', 'ICLN'];

  const { data: equityQuotes } = useQuotes(allEquitySymbols);
  const { data: commodityQuotes } = useQuotes(allCommoditySymbols);
  const { data: dashQuotes } = useQuotes(dashSymbols);

  const { data: xleSparkData } = useSparkline('XLE', '1m');
  const { data: xopSparkData } = useSparkline('XOP', '1m');
  const { data: iclnSparkData } = useSparkline('ICLN', '1m');

  const wtiPrice = dashQuotes?.['CL=F']?.regularMarketPrice;
  const wtiChange = dashQuotes?.['CL=F']?.regularMarketChangePercent;
  const ngPrice = dashQuotes?.['NG=F']?.regularMarketPrice;
  const ngChange = dashQuotes?.['NG=F']?.regularMarketChangePercent;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-mono text-terminal-energy uppercase tracking-wider flex items-center gap-2">
          ⚡ Energy Command Center
        </h1>
        <div className="flex items-center bg-terminal-card rounded-md border border-terminal-border overflow-hidden">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors ${
                tab === t
                  ? 'bg-terminal-energy text-black'
                  : 'text-terminal-text-secondary hover:text-terminal-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Energy Dashboard Summary */}
      <div className="grid grid-cols-4 gap-3">
        {/* WTI Crude - Large */}
        <div className="col-span-2 bg-terminal-card border border-terminal-energy/30 rounded-lg p-5">
          <div className="text-[10px] font-mono text-terminal-energy uppercase tracking-wider mb-1">WTI Crude Oil</div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-4xl font-bold text-terminal-text">
              ${wtiPrice?.toFixed(2) || '—'}
            </span>
            <span className={`font-mono text-lg ${(wtiChange || 0) >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
              {(wtiChange || 0) >= 0 ? '+' : ''}{wtiChange?.toFixed(2) || '0.00'}%
            </span>
          </div>
        </div>

        {/* Natural Gas */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-5">
          <div className="text-[10px] font-mono text-terminal-text-secondary uppercase tracking-wider mb-1">Natural Gas</div>
          <div className="font-mono text-2xl font-bold text-terminal-text">
            ${ngPrice?.toFixed(2) || '—'}
          </div>
          <div className={`font-mono text-sm ${(ngChange || 0) >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
            {(ngChange || 0) >= 0 ? '+' : ''}{ngChange?.toFixed(2) || '0.00'}%
          </div>
        </div>

        {/* Baker Hughes */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-5">
          <div className="text-[10px] font-mono text-terminal-text-secondary uppercase tracking-wider mb-1">Rig Count</div>
          <div className="text-xs text-terminal-text-secondary mt-2">
            Baker Hughes Weekly Rig Count
          </div>
          <a
            href="https://bakerhughesrigcount.gcs-web.com/rig-count/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-terminal-accent hover:underline mt-1 inline-block"
          >
            View External →
          </a>
        </div>
      </div>

      {/* ETF Comparison Sparklines */}
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
        <h3 className="text-xs font-mono text-terminal-text-secondary uppercase tracking-wider mb-3">
          YTD Comparison — XLE vs XOP vs ICLN
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'XLE (Energy Select)', data: xleSparkData, quote: dashQuotes?.XLE },
            { label: 'XOP (Oil & Gas E&P)', data: xopSparkData, quote: dashQuotes?.XOP },
            { label: 'ICLN (Clean Energy)', data: iclnSparkData, quote: dashQuotes?.ICLN },
          ].map(({ label, data, quote }) => (
            <div key={label} className="text-center">
              <div className="text-[10px] font-mono text-terminal-text-secondary mb-2">{label}</div>
              <div className="flex justify-center">
                <Sparkline data={data || []} width={200} height={48} />
              </div>
              <div className={`font-mono text-sm mt-1 ${
                (quote?.regularMarketChangePercent || 0) >= 0 ? 'text-terminal-green' : 'text-terminal-red'
              }`}>
                {(quote?.regularMarketChangePercent || 0) >= 0 ? '+' : ''}
                {quote?.regularMarketChangePercent?.toFixed(2) || '0.00'}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'Equities' && (
        <div className="space-y-4">
          {Object.entries(ENERGY_EQUITIES).map(([category, symbols]) => (
            <div key={category} className="bg-terminal-card border border-terminal-border rounded-lg p-4">
              <h3 className="text-xs font-mono text-terminal-energy uppercase tracking-wider mb-2">{category}</h3>
              <div className="divide-y divide-terminal-border">
                {symbols.map((sym) => (
                  <EnergyEquityRow
                    key={sym}
                    symbol={sym}
                    quote={equityQuotes?.[sym]}
                    onClick={() => openModal(sym)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Commodities' && (
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <h3 className="text-xs font-mono text-terminal-energy uppercase tracking-wider mb-3">Energy Commodities</h3>
          <div className="divide-y divide-terminal-border">
            {ENERGY_COMMODITIES.map(({ name, symbol }) => {
              const q = commodityQuotes?.[symbol];
              const pct = q?.regularMarketChangePercent || 0;
              const isUp = pct >= 0;
              return (
                <div
                  key={symbol}
                  onClick={() => openModal(symbol)}
                  className="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-terminal-surface rounded transition-colors"
                >
                  <div>
                    <span className="text-sm text-terminal-text">{name}</span>
                    <span className="text-xs font-mono text-terminal-text-secondary ml-2">{symbol}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-terminal-text">
                      ${q?.regularMarketPrice?.toFixed(2) || '—'}
                    </span>
                    <span className={`font-mono text-xs ${isUp ? 'text-terminal-green' : 'text-terminal-red'}`}>
                      {isUp ? '+' : ''}{pct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
