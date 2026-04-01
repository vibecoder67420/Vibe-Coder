import { useMemo, useState } from 'react';
import { useQuotes } from '../hooks/useMarketData';
import { SP500_COMPANIES } from '../data/tickers';
import useStore from '../store/useStore';

function getColor(pct) {
  if (pct === null || pct === undefined) return '#2a2a3a';
  const clamped = Math.max(-5, Math.min(5, pct));
  if (clamped >= 0) {
    const intensity = clamped / 5;
    const r = Math.round(20 + (0 - 20) * intensity);
    const g = Math.round(30 + (200 - 30) * intensity);
    const b = Math.round(40 + (150 - 40) * intensity);
    return `rgb(${r},${g},${b})`;
  } else {
    const intensity = Math.abs(clamped) / 5;
    const r = Math.round(30 + (255 - 30) * intensity);
    const g = Math.round(25 + (69 - 25) * intensity);
    const b = Math.round(35 + (96 - 35) * intensity);
    return `rgb(${r},${g},${b})`;
  }
}

function treemapLayout(items, x, y, w, h) {
  if (items.length === 0) return [];
  const totalWeight = items.reduce((sum, it) => sum + it.weight, 0);
  if (totalWeight === 0) return [];

  const rects = [];
  let cx = x, cy = y, cw = w, ch = h;
  const sorted = [...items].sort((a, b) => b.weight - a.weight);

  // Simple squarified treemap approximation
  let remaining = [...sorted];
  while (remaining.length > 0) {
    const isWide = cw >= ch;
    const totalRemaining = remaining.reduce((s, it) => s + it.weight, 0);

    // Find optimal row
    let row = [remaining[0]];
    let rowWeight = remaining[0].weight;

    for (let i = 1; i < remaining.length; i++) {
      const nextWeight = rowWeight + remaining[i].weight;
      row.push(remaining[i]);
      rowWeight = nextWeight;
      if (rowWeight / totalRemaining > 0.5) break;
    }

    remaining = remaining.slice(row.length);
    const rowFraction = rowWeight / totalRemaining;

    if (isWide) {
      const rowW = cw * rowFraction;
      let ry = cy;
      for (const item of row) {
        const itemH = ch * (item.weight / rowWeight);
        rects.push({ ...item, x: cx, y: ry, w: rowW, h: itemH });
        ry += itemH;
      }
      cx += rowW;
      cw -= rowW;
    } else {
      const rowH = ch * rowFraction;
      let rx = cx;
      for (const item of row) {
        const itemW = cw * (item.weight / rowWeight);
        rects.push({ ...item, x: rx, y: cy, w: itemW, h: rowH });
        rx += itemW;
      }
      cy += rowH;
      ch -= rowH;
    }
  }

  return rects;
}

export default function Heatmap() {
  const openModal = useStore((s) => s.openModal);
  const [hoveredSymbol, setHoveredSymbol] = useState(null);
  const [groupBy, setGroupBy] = useState('sector');

  const symbols = SP500_COMPANIES.map((c) => c.symbol);
  const { data: quotes, isLoading } = useQuotes(symbols);

  const rects = useMemo(() => {
    if (!quotes) return [];

    // Group by sector
    const sectors = {};
    for (const company of SP500_COMPANIES) {
      const q = quotes[company.symbol];
      if (!q) continue;
      const sector = company.sector;
      if (!sectors[sector]) sectors[sector] = [];
      sectors[sector].push({
        symbol: company.symbol,
        name: company.name,
        sector,
        weight: company.marketCap,
        pct: q.regularMarketChangePercent || 0,
        price: q.regularMarketPrice,
        marketCap: q.marketCap,
      });
    }

    // Layout sectors first
    const sectorItems = Object.entries(sectors).map(([name, companies]) => ({
      name,
      weight: companies.reduce((s, c) => s + c.weight, 0),
      companies,
    }));

    const sectorRects = treemapLayout(sectorItems, 0, 0, 100, 100);
    const allRects = [];

    for (const sr of sectorRects) {
      const companyRects = treemapLayout(
        sr.companies,
        sr.x, sr.y, sr.w, sr.h
      );
      allRects.push(...companyRects);
    }

    return allRects;
  }, [quotes]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-terminal-text-secondary font-mono text-sm animate-pulse">
          Loading market heatmap...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-mono text-terminal-accent uppercase tracking-wider">
          Market Heatmap — S&P 500
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center text-[10px] font-mono text-terminal-text-secondary gap-2">
            <span className="inline-block w-3 h-3 rounded" style={{ background: getColor(-5) }} /> -5%
            <span className="inline-block w-3 h-3 rounded" style={{ background: getColor(-2) }} /> -2%
            <span className="inline-block w-3 h-3 rounded" style={{ background: getColor(0) }} /> 0%
            <span className="inline-block w-3 h-3 rounded" style={{ background: getColor(2) }} /> +2%
            <span className="inline-block w-3 h-3 rounded" style={{ background: getColor(5) }} /> +5%
          </div>
        </div>
      </div>

      <div className="relative w-full" style={{ paddingBottom: '60%' }}>
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {rects.map((r) => (
            <g
              key={r.symbol}
              onClick={() => openModal(r.symbol)}
              onMouseEnter={() => setHoveredSymbol(r.symbol)}
              onMouseLeave={() => setHoveredSymbol(null)}
              className="cursor-pointer"
            >
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                fill={getColor(r.pct)}
                stroke="var(--bg)"
                strokeWidth="0.15"
                rx="0.1"
                opacity={hoveredSymbol && hoveredSymbol !== r.symbol ? 0.6 : 1}
              />
              {r.w > 3 && r.h > 3 && (
                <>
                  <text
                    x={r.x + r.w / 2}
                    y={r.y + r.h / 2 - (r.h > 5 ? 0.8 : 0)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={r.w > 6 ? '0.9' : '0.65'}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                  >
                    {r.symbol}
                  </text>
                  {r.w > 5 && r.h > 5 && (
                    <text
                      x={r.x + r.w / 2}
                      y={r.y + r.h / 2 + 1.3}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="0.7"
                      fontFamily="JetBrains Mono, monospace"
                      opacity="0.8"
                    >
                      {r.pct >= 0 ? '+' : ''}{r.pct.toFixed(1)}%
                    </text>
                  )}
                </>
              )}
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredSymbol && (() => {
          const r = rects.find((r) => r.symbol === hoveredSymbol);
          if (!r) return null;
          return (
            <div className="absolute top-2 right-2 bg-terminal-surface border border-terminal-border rounded-lg p-3 shadow-xl z-10 min-w-[200px]">
              <div className="font-mono text-sm font-bold text-terminal-text">{r.symbol}</div>
              <div className="text-xs text-terminal-text-secondary mb-2">{r.name} — {r.sector}</div>
              <div className="font-mono text-lg text-terminal-text">${r.price?.toFixed(2)}</div>
              <div className={`font-mono text-sm ${r.pct >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                {r.pct >= 0 ? '+' : ''}{r.pct.toFixed(2)}%
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
