import { useState } from 'react';
import { useQuotes } from '../hooks/useMarketData';
import { FX_PAIRS, BONDS } from '../data/tickers';
import AssetCard from '../components/AssetCard';
import useStore from '../store/useStore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const TABS = ['FX', 'Bonds & Rates'];

// Approximate yield curve data points (maturities in months)
const YIELD_MATURITIES = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '2Y', months: 24 },
  { label: '5Y', months: 60 },
  { label: '10Y', months: 120 },
  { label: '30Y', months: 360 },
];

export default function FxRates() {
  const [tab, setTab] = useState('FX');
  const openModal = useStore((s) => s.openModal);

  const fxSymbols = FX_PAIRS.map((p) => p.symbol);
  const bondSymbols = BONDS.map((b) => b.symbol);
  const { data: fxQuotes } = useQuotes(fxSymbols);
  const { data: bondQuotes } = useQuotes(bondSymbols);

  // Build yield curve from available data
  const buildYieldCurve = () => {
    const twoY = bondQuotes?.['^IRX']?.regularMarketPrice;
    const tenY = bondQuotes?.['^TNX']?.regularMarketPrice;
    const thirtyY = bondQuotes?.['^TYX']?.regularMarketPrice;

    if (!twoY && !tenY && !thirtyY) return [];

    // Interpolate a rough curve
    const points = [];
    const known = {};
    if (twoY) known[24] = twoY;
    if (tenY) known[120] = tenY;
    if (thirtyY) known[360] = thirtyY;

    for (const m of YIELD_MATURITIES) {
      let rate = known[m.months];
      if (!rate) {
        // Simple linear interpolation
        const knownMonths = Object.keys(known).map(Number).sort((a, b) => a - b);
        if (knownMonths.length >= 2) {
          const lower = knownMonths.filter((k) => k <= m.months).pop() || knownMonths[0];
          const upper = knownMonths.filter((k) => k >= m.months)[0] || knownMonths[knownMonths.length - 1];
          if (lower === upper) {
            rate = known[lower];
          } else {
            const t = (m.months - lower) / (upper - lower);
            rate = known[lower] + t * (known[upper] - known[lower]);
          }
        } else if (knownMonths.length === 1) {
          rate = known[knownMonths[0]];
        }
      }
      if (rate) {
        points.push({ maturity: m.label, current: parseFloat(rate.toFixed(3)) });
      }
    }
    return points;
  };

  const yieldCurveData = buildYieldCurve();
  const isInverted = yieldCurveData.length >= 2 &&
    yieldCurveData[0].current > yieldCurveData[yieldCurveData.length - 1].current;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-mono text-terminal-accent uppercase tracking-wider">FX & Rates</h1>
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

      {tab === 'FX' && (
        <div className="grid grid-cols-3 gap-3">
          {FX_PAIRS.map(({ name, symbol }) => (
            <AssetCard
              key={symbol}
              symbol={symbol}
              name={name}
              quote={fxQuotes?.[symbol]}
              onClick={() => openModal(symbol)}
              compact
            />
          ))}
        </div>
      )}

      {tab === 'Bonds & Rates' && (
        <div className="space-y-6">
          {/* Yield Curve */}
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono text-terminal-text-secondary uppercase tracking-wider">
                US Treasury Yield Curve
              </h3>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                isInverted
                  ? 'bg-terminal-red/20 text-terminal-red'
                  : 'bg-terminal-green/20 text-terminal-green'
              }`}>
                {isInverted ? 'INVERTED ⚠️' : 'Normal'}
              </span>
            </div>
            {yieldCurveData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={yieldCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="maturity"
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => v.toFixed(1) + '%'}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                    }}
                    formatter={(value) => [value.toFixed(3) + '%', 'Yield']}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke={isInverted ? '#ff4560' : '#00c896'}
                    strokeWidth={2}
                    dot={{ fill: isInverted ? '#ff4560' : '#00c896', r: 4 }}
                    name="Current"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-terminal-text-secondary text-sm font-mono">
                Loading yield curve data...
              </div>
            )}
          </div>

          {/* Bond Cards */}
          <div className="grid grid-cols-3 gap-3">
            {BONDS.map(({ name, symbol }) => (
              <AssetCard
                key={symbol}
                symbol={symbol}
                name={name}
                quote={bondQuotes?.[symbol]}
                onClick={() => openModal(symbol)}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
