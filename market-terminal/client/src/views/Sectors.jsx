import { useState } from 'react';
import { useQuotes } from '../hooks/useMarketData';
import { SECTORS, SECTOR_HOLDINGS } from '../data/tickers';
import Sparkline from '../components/Sparkline';
import { useSparkline } from '../hooks/useMarketData';
import useStore from '../store/useStore';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Label
} from 'recharts';

function SectorCard({ sector, quote, spyQuote, onClick, onExpand, expanded }) {
  const { data: sparkData } = useSparkline(sector.etf, '1w');
  const holdings = SECTOR_HOLDINGS[sector.etf]?.slice(0, 3) || [];
  const openModal = useStore((s) => s.openModal);

  const pct = quote?.regularMarketChangePercent || 0;
  const isUp = pct >= 0;
  const spyYtd = spyQuote?.ytdReturn || 0;

  return (
    <div
      className={`bg-terminal-card border border-terminal-border rounded-lg p-5 hover:border-terminal-accent transition-all cursor-pointer ${
        expanded ? 'col-span-2' : ''
      }`}
      onClick={onExpand}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-mono text-base font-semibold text-terminal-text">{sector.name}</h3>
          <span className="text-xs font-mono text-terminal-text-secondary">{sector.etf}</span>
        </div>
        <Sparkline data={sparkData || []} width={80} height={32} />
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-mono text-sm text-terminal-text">
          ${quote?.regularMarketPrice?.toFixed(2) || '—'}
        </span>
        <span className={`font-mono text-2xl font-bold ${isUp ? 'text-terminal-green' : 'text-terminal-red'}`}>
          {isUp ? '+' : ''}{pct.toFixed(2)}%
        </span>
      </div>

      <div className="space-y-1 mb-3">
        <div className="text-[10px] font-mono text-terminal-text-secondary uppercase tracking-wider">Top Holdings</div>
        {holdings.map((h) => (
          <div key={h} className="flex items-center justify-between text-xs font-mono">
            <span
              className="text-terminal-text hover:text-terminal-accent cursor-pointer"
              onClick={(e) => { e.stopPropagation(); openModal(h); }}
            >
              {h}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Sectors() {
  const [expandedSector, setExpandedSector] = useState(null);
  const openModal = useStore((s) => s.openModal);

  const sectorSymbols = SECTORS.map((s) => s.etf);
  const allHoldings = Object.values(SECTOR_HOLDINGS).flat();
  const { data: sectorQuotes } = useQuotes([...sectorSymbols, 'SPY']);
  const { data: holdingQuotes } = useQuotes(allHoldings);

  // Sector rotation data
  const rotationData = SECTORS.map((s) => {
    const q = sectorQuotes?.[s.etf];
    const spyQ = sectorQuotes?.SPY;
    if (!q || !spyQ) return null;
    const relStrength = (q.regularMarketChangePercent || 0) - (spyQ.regularMarketChangePercent || 0);
    const momentum = q.regularMarketChangePercent || 0;
    return {
      name: s.name.split(' ')[0],
      etf: s.etf,
      x: relStrength,
      y: momentum,
    };
  }).filter(Boolean);

  const expandedHoldings = expandedSector
    ? (SECTOR_HOLDINGS[expandedSector] || []).map((sym) => ({
        symbol: sym,
        quote: holdingQuotes?.[sym],
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-sm font-mono text-terminal-accent uppercase tracking-wider">GICS Sector Analysis</h1>

      {/* Sector Rotation Chart */}
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
        <h3 className="text-xs font-mono text-terminal-text-secondary uppercase tracking-wider mb-3">
          Sector Rotation — Relative Strength vs Momentum
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              dataKey="x"
              name="Relative Strength"
              stroke="var(--text-secondary)"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
              domain={['auto', 'auto']}
            >
              <Label value="Relative Strength vs S&P" position="bottom" offset={0} style={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              name="Momentum"
              stroke="var(--text-secondary)"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
              domain={['auto', 'auto']}
            >
              <Label value="Momentum" angle={-90} position="left" offset={10} style={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            </YAxis>
            <ReferenceLine x={0} stroke="var(--text-secondary)" strokeDasharray="3 3" />
            <ReferenceLine y={0} stroke="var(--text-secondary)" strokeDasharray="3 3" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono',
                fontSize: 11,
              }}
              formatter={(value, name) => [value.toFixed(2) + '%', name]}
            />
            <Scatter data={rotationData} fill="#6366f1">
              {rotationData.map((entry, i) => (
                <circle key={i} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-4 text-[9px] font-mono text-terminal-text-secondary text-center mt-1">
          <span>Weakening</span>
          <span>Lagging</span>
          <span>Improving</span>
          <span>Leading</span>
        </div>
      </div>

      {/* Sector Cards */}
      <div className="grid grid-cols-2 gap-4">
        {SECTORS.map((sector) => (
          <SectorCard
            key={sector.etf}
            sector={sector}
            quote={sectorQuotes?.[sector.etf]}
            spyQuote={sectorQuotes?.SPY}
            expanded={expandedSector === sector.etf}
            onExpand={() => setExpandedSector(expandedSector === sector.etf ? null : sector.etf)}
          />
        ))}
      </div>

      {/* Expanded Sector Detail */}
      {expandedSector && (
        <div className="bg-terminal-card border border-terminal-accent/30 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-semibold text-terminal-accent">
              {SECTORS.find((s) => s.etf === expandedSector)?.name} — Top Holdings
            </h3>
            <button
              onClick={() => openModal(expandedSector)}
              className="text-xs font-mono text-terminal-accent hover:underline"
            >
              View {expandedSector} Chart →
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {expandedHoldings.map(({ symbol, quote }) => {
              const pct = quote?.regularMarketChangePercent || 0;
              const isUp = pct >= 0;
              return (
                <div
                  key={symbol}
                  onClick={() => openModal(symbol)}
                  className="bg-terminal-surface border border-terminal-border rounded-md p-3 cursor-pointer hover:border-terminal-accent transition-all"
                >
                  <div className="font-mono text-xs font-semibold text-terminal-text">{symbol}</div>
                  <div className="text-[10px] text-terminal-text-secondary truncate">{quote?.shortName || ''}</div>
                  <div className="font-mono text-sm text-terminal-text mt-1">
                    ${quote?.regularMarketPrice?.toFixed(2) || '—'}
                  </div>
                  <div className={`font-mono text-xs ${isUp ? 'text-terminal-green' : 'text-terminal-red'}`}>
                    {isUp ? '+' : ''}{pct.toFixed(2)}%
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
