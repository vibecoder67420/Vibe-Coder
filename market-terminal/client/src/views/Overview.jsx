import ExecSummary from '../components/ExecSummary';
import StatPill from '../components/StatPill';
import { useQuotes, useMovers } from '../hooks/useMarketData';
import useStore from '../store/useStore';
import { SECTORS } from '../data/tickers';
import { useNavigate } from 'react-router-dom';

const KEY_STATS = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'Nasdaq' },
  { symbol: 'IWM', name: 'Russell 2000' },
  { symbol: '^TNX', name: '10Y Yield' },
  { symbol: 'GLD', name: 'Gold' },
  { symbol: 'CL=F', name: 'WTI Crude' },
];

const MACRO_SYMBOLS = ['^TNX', '^IRX', 'DX-Y.NYB', '^VIX', 'CL=F', 'NG=F'];

export default function Overview() {
  const openModal = useStore((s) => s.openModal);
  const navigate = useNavigate();

  const keySymbols = KEY_STATS.map((s) => s.symbol);
  const sectorSymbols = SECTORS.map((s) => s.etf);
  const { data: keyQuotes, isLoading: keyLoading } = useQuotes(keySymbols);
  const { data: sectorQuotes } = useQuotes(sectorSymbols);
  const { data: macroQuotes } = useQuotes(MACRO_SYMBOLS);
  const { data: movers, isLoading: moversLoading } = useMovers();

  const getVixLabel = (vix) => {
    if (!vix) return { label: '—', color: 'text-terminal-text-secondary' };
    const val = vix.regularMarketPrice;
    if (val < 15) return { label: 'Calm', color: 'text-terminal-green' };
    if (val < 25) return { label: 'Elevated', color: 'text-terminal-energy' };
    return { label: 'Fear', color: 'text-terminal-red' };
  };

  const vixStatus = macroQuotes ? getVixLabel(macroQuotes['^VIX']) : { label: '—', color: '' };

  const getYieldCurveStatus = () => {
    if (!macroQuotes || !macroQuotes['^TNX'] || !macroQuotes['^IRX']) return null;
    const tenY = macroQuotes['^TNX']?.regularMarketPrice;
    const twoY = macroQuotes['^IRX']?.regularMarketPrice;
    if (!tenY || !twoY) return null;
    const spread = tenY - twoY;
    return { spread, inverted: spread < 0 };
  };

  const yieldCurve = getYieldCurveStatus();

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <ExecSummary />

      {/* Key Stats */}
      <div className="grid grid-cols-6 gap-3">
        {KEY_STATS.map(({ symbol, name }) => (
          <StatPill
            key={symbol}
            symbol={symbol}
            name={name}
            quote={keyQuotes?.[symbol]}
            onClick={() => openModal(symbol)}
          />
        ))}
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <h3 className="text-xs font-mono text-terminal-green uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-green" />
            Top Gainers
          </h3>
          {moversLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
            </div>
          ) : (
            <div className="space-y-1">
              {movers?.gainers?.map((m) => (
                <div
                  key={m.symbol}
                  onClick={() => openModal(m.symbol)}
                  className="flex items-center justify-between py-2 px-2 rounded hover:bg-terminal-surface cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-terminal-text w-16">{m.symbol}</span>
                    <span className="text-xs text-terminal-text-secondary truncate max-w-[120px]">{m.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm text-terminal-text">${m.price?.toFixed(2)}</span>
                    <span className="font-mono text-xs text-terminal-green ml-2">
                      +{m.changePercent?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <h3 className="text-xs font-mono text-terminal-red uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-red" />
            Top Losers
          </h3>
          {moversLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
            </div>
          ) : (
            <div className="space-y-1">
              {movers?.losers?.map((m) => (
                <div
                  key={m.symbol}
                  onClick={() => openModal(m.symbol)}
                  className="flex items-center justify-between py-2 px-2 rounded hover:bg-terminal-surface cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-terminal-text w-16">{m.symbol}</span>
                    <span className="text-xs text-terminal-text-secondary truncate max-w-[120px]">{m.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm text-terminal-text">${m.price?.toFixed(2)}</span>
                    <span className="font-mono text-xs text-terminal-red ml-2">
                      {m.changePercent?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mini Heatmap - Sector Performance */}
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
        <h3 className="text-xs font-mono text-terminal-accent uppercase tracking-wider mb-3">
          Sector Performance
        </h3>
        <div className="grid grid-cols-11 gap-1.5">
          {SECTORS.map(({ name, etf }) => {
            const q = sectorQuotes?.[etf];
            const pct = q?.regularMarketChangePercent || 0;
            const isUp = pct >= 0;
            const intensity = Math.min(Math.abs(pct) / 3, 1);
            const bg = isUp
              ? `rgba(0, 200, 150, ${0.1 + intensity * 0.4})`
              : `rgba(255, 69, 96, ${0.1 + intensity * 0.4})`;

            return (
              <div
                key={etf}
                onClick={() => navigate('/sectors')}
                className="rounded-md p-2 text-center cursor-pointer hover:ring-1 hover:ring-terminal-accent transition-all"
                style={{ backgroundColor: bg }}
              >
                <div className="text-[10px] font-mono text-terminal-text-secondary truncate">{name.split(' ')[0]}</div>
                <div className={`text-sm font-mono font-bold ${isUp ? 'text-terminal-green' : 'text-terminal-red'}`}>
                  {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
                </div>
                <div className="text-[9px] font-mono text-terminal-text-secondary">{etf}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macro Snapshot */}
      <div className="grid grid-cols-4 gap-3">
        {/* Bonds */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <h4 className="text-[10px] font-mono text-terminal-text-secondary uppercase tracking-wider mb-2">Bonds</h4>
          {yieldCurve ? (
            <>
              <div className="font-mono text-lg font-bold text-terminal-text">
                {yieldCurve.spread > 0 ? '+' : ''}{yieldCurve.spread.toFixed(2)}%
              </div>
              <div className={`text-xs font-mono ${yieldCurve.inverted ? 'text-terminal-red' : 'text-terminal-green'}`}>
                2Y/10Y Spread — {yieldCurve.inverted ? 'INVERTED' : 'Normal'}
              </div>
            </>
          ) : (
            <div className="skeleton h-10 w-full" />
          )}
        </div>

        {/* Dollar */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <h4 className="text-[10px] font-mono text-terminal-text-secondary uppercase tracking-wider mb-2">US Dollar (DXY)</h4>
          {macroQuotes?.['DX-Y.NYB'] ? (
            <>
              <div className="font-mono text-lg font-bold text-terminal-text">
                {macroQuotes['DX-Y.NYB'].regularMarketPrice?.toFixed(2)}
              </div>
              <div className={`text-xs font-mono ${macroQuotes['DX-Y.NYB'].regularMarketChange >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                {macroQuotes['DX-Y.NYB'].regularMarketChange >= 0 ? '+' : ''}{macroQuotes['DX-Y.NYB'].regularMarketChangePercent?.toFixed(2)}%
              </div>
            </>
          ) : (
            <div className="skeleton h-10 w-full" />
          )}
        </div>

        {/* VIX */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <h4 className="text-[10px] font-mono text-terminal-text-secondary uppercase tracking-wider mb-2">VIX</h4>
          {macroQuotes?.['^VIX'] ? (
            <>
              <div className="font-mono text-lg font-bold text-terminal-text">
                {macroQuotes['^VIX'].regularMarketPrice?.toFixed(2)}
              </div>
              <div className={`text-xs font-mono font-semibold ${vixStatus.color}`}>
                {vixStatus.label}
              </div>
            </>
          ) : (
            <div className="skeleton h-10 w-full" />
          )}
        </div>

        {/* Energy */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <h4 className="text-[10px] font-mono text-terminal-text-secondary uppercase tracking-wider mb-2">Energy</h4>
          {macroQuotes?.['CL=F'] ? (
            <>
              <div className="font-mono text-sm text-terminal-text">
                WTI <span className="font-bold">${macroQuotes['CL=F'].regularMarketPrice?.toFixed(2)}</span>
              </div>
              <div className="font-mono text-sm text-terminal-text">
                NatGas <span className="font-bold">${macroQuotes['NG=F']?.regularMarketPrice?.toFixed(2) || '—'}</span>
              </div>
            </>
          ) : (
            <div className="skeleton h-10 w-full" />
          )}
        </div>
      </div>
    </div>
  );
}
