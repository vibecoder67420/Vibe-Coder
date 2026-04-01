import { useState, useMemo } from 'react';
import { useQuotes } from '../hooks/useMarketData';
import { SP500_COMPANIES, SECTORS } from '../data/tickers';
import useStore from '../store/useStore';
import { Search, Download, ArrowUpDown } from 'lucide-react';

const ASSET_CLASSES = ['All', 'Equity', 'ETF', 'Commodity', 'Crypto', 'FX', 'Bond'];

// Build full ticker list for screener
const ALL_SCREENER_TICKERS = SP500_COMPANIES.map((c) => ({
  symbol: c.symbol,
  name: c.name,
  sector: c.sector,
  assetClass: 'Equity',
}));

export default function Screener() {
  const openModal = useStore((s) => s.openModal);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('symbol');
  const [sortDir, setSortDir] = useState('asc');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [assetFilter, setAssetFilter] = useState('All');
  const [showGainers, setShowGainers] = useState(false);
  const [showLosers, setShowLosers] = useState(false);

  const symbols = ALL_SCREENER_TICKERS.map((t) => t.symbol);
  const { data: quotes, isLoading } = useQuotes(symbols);

  const rows = useMemo(() => {
    if (!quotes) return [];

    return ALL_SCREENER_TICKERS.map((t) => {
      const q = quotes[t.symbol];
      return {
        ...t,
        price: q?.regularMarketPrice || null,
        change1d: q?.regularMarketChangePercent || null,
        high52: q?.fiftyTwoWeekHigh || null,
        low52: q?.fiftyTwoWeekLow || null,
        marketCap: q?.marketCap || null,
      };
    })
    .filter((r) => {
      if (search) {
        const s = search.toLowerCase();
        if (!r.symbol.toLowerCase().includes(s) && !r.name.toLowerCase().includes(s)) return false;
      }
      if (sectorFilter !== 'All' && r.sector !== sectorFilter) return false;
      if (assetFilter !== 'All' && r.assetClass !== assetFilter) return false;
      if (showGainers && (r.change1d === null || r.change1d <= 0)) return false;
      if (showLosers && (r.change1d === null || r.change1d >= 0)) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (aVal === null) aVal = sortDir === 'asc' ? Infinity : -Infinity;
      if (bVal === null) bVal = sortDir === 'asc' ? Infinity : -Infinity;
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [quotes, search, sortKey, sortDir, sectorFilter, assetFilter, showGainers, showLosers]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Symbol', 'Name', 'Price', '1D%', '52W High', '52W Low', 'Market Cap', 'Sector'];
    const csvRows = [headers.join(',')];
    for (const r of rows) {
      csvRows.push([
        r.symbol, `"${r.name}"`, r.price?.toFixed(2) || '', r.change1d?.toFixed(2) || '',
        r.high52?.toFixed(2) || '', r.low52?.toFixed(2) || '',
        r.marketCap || '', r.sector,
      ].join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screener_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sectorOptions = ['All', ...SECTORS.map((s) => s.name)];

  const SortHeader = ({ label, field, className = '' }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-[10px] font-mono text-terminal-text-secondary uppercase tracking-wider hover:text-terminal-text ${className}`}
    >
      {label}
      {sortKey === field && (
        <ArrowUpDown size={10} className={sortDir === 'desc' ? 'rotate-180' : ''} />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-mono text-terminal-accent uppercase tracking-wider">Screener</h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-terminal-card border border-terminal-border rounded-md hover:border-terminal-accent text-terminal-text-secondary hover:text-terminal-text transition-colors"
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-terminal-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticker or name..."
            className="bg-terminal-card border border-terminal-border rounded-md pl-8 pr-3 py-1.5 text-xs font-mono text-terminal-text placeholder-terminal-text-secondary focus:outline-none focus:border-terminal-accent w-56"
          />
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="bg-terminal-card border border-terminal-border rounded-md px-3 py-1.5 text-xs font-mono text-terminal-text focus:outline-none focus:border-terminal-accent"
        >
          {sectorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <button
          onClick={() => { setShowGainers(!showGainers); setShowLosers(false); }}
          className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors ${
            showGainers
              ? 'bg-terminal-green/20 border-terminal-green text-terminal-green'
              : 'bg-terminal-card border-terminal-border text-terminal-text-secondary hover:text-terminal-text'
          }`}
        >
          Gainers Only
        </button>

        <button
          onClick={() => { setShowLosers(!showLosers); setShowGainers(false); }}
          className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors ${
            showLosers
              ? 'bg-terminal-red/20 border-terminal-red text-terminal-red'
              : 'bg-terminal-card border-terminal-border text-terminal-text-secondary hover:text-terminal-text'
          }`}
        >
          Losers Only
        </button>

        <span className="text-[10px] font-mono text-terminal-text-secondary ml-auto">
          {rows.length} results
        </span>
      </div>

      {/* Table */}
      <div className="bg-terminal-card border border-terminal-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-terminal-surface border-b border-terminal-border">
                <th className="text-left py-2 px-3"><SortHeader label="Ticker" field="symbol" /></th>
                <th className="text-left py-2 px-3"><SortHeader label="Name" field="name" /></th>
                <th className="text-right py-2 px-3"><SortHeader label="Price" field="price" /></th>
                <th className="text-right py-2 px-3"><SortHeader label="1D %" field="change1d" /></th>
                <th className="text-right py-2 px-3"><SortHeader label="52W High" field="high52" /></th>
                <th className="text-right py-2 px-3"><SortHeader label="52W Low" field="low52" /></th>
                <th className="text-right py-2 px-3"><SortHeader label="Mkt Cap" field="marketCap" /></th>
                <th className="text-left py-2 px-3"><SortHeader label="Sector" field="sector" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border">
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="py-2.5 px-3"><div className="skeleton h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : (
                rows.map((r) => {
                  const isUp = (r.change1d || 0) >= 0;
                  return (
                    <tr
                      key={r.symbol}
                      onClick={() => openModal(r.symbol)}
                      className="hover:bg-terminal-surface cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-xs font-semibold text-terminal-text">{r.symbol}</td>
                      <td className="py-2.5 px-3 text-xs text-terminal-text-secondary truncate max-w-[160px]">{r.name}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-terminal-text text-right">
                        {r.price ? '$' + r.price.toFixed(2) : '—'}
                      </td>
                      <td className={`py-2.5 px-3 font-mono text-xs text-right ${isUp ? 'text-terminal-green' : 'text-terminal-red'}`}>
                        {r.change1d !== null ? (isUp ? '+' : '') + r.change1d.toFixed(2) + '%' : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-terminal-text-secondary text-right">
                        {r.high52 ? '$' + r.high52.toFixed(2) : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-terminal-text-secondary text-right">
                        {r.low52 ? '$' + r.low52.toFixed(2) : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-terminal-text-secondary text-right">
                        {r.marketCap ? '$' + (r.marketCap / 1e9).toFixed(0) + 'B' : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-terminal-text-secondary">{r.sector}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
