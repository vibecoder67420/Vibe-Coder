import { useMemo } from 'react';
import { useQuotes } from '../hooks/useMarketData';
import { CRYPTO, STABLECOINS } from '../data/tickers';
import useStore from '../store/useStore';
import Sparkline from '../components/Sparkline';
import { useSparkline } from '../hooks/useMarketData';

function CryptoRow({ symbol, quote, isStablecoin, onClick }) {
  const { data: sparkData } = useSparkline(symbol, '1w');
  const pct = quote?.regularMarketChangePercent || 0;
  const isUp = pct >= 0;
  const ticker = symbol.replace('-USD', '');

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between py-3 px-4 rounded-lg hover:bg-terminal-surface cursor-pointer transition-colors ${
        isStablecoin ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        <span className={`font-mono text-sm font-bold w-12 ${isStablecoin ? 'text-terminal-text-secondary' : 'text-terminal-text'}`}>
          {ticker}
        </span>
        <span className="text-xs text-terminal-text-secondary truncate max-w-[160px]">
          {quote?.shortName || quote?.longName || symbol}
        </span>
        {isStablecoin && (
          <span className="text-[9px] font-mono bg-terminal-accent/20 text-terminal-accent px-1.5 py-0.5 rounded">
            STABLE
          </span>
        )}
      </div>
      <div className="flex items-center gap-6">
        <Sparkline data={sparkData || []} width={60} height={24} />
        <span className="font-mono text-sm text-terminal-text w-24 text-right">
          ${quote?.regularMarketPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '—'}
        </span>
        <span className={`font-mono text-xs w-16 text-right ${isUp ? 'text-terminal-green' : 'text-terminal-red'}`}>
          {isUp ? '+' : ''}{pct.toFixed(2)}%
        </span>
        <span className="font-mono text-xs text-terminal-text-secondary w-24 text-right">
          {quote?.marketCap ? '$' + (quote.marketCap / 1e9).toFixed(1) + 'B' : '—'}
        </span>
      </div>
    </div>
  );
}

export default function CryptoPage() {
  const openModal = useStore((s) => s.openModal);
  const { data: quotes } = useQuotes(CRYPTO);

  const btcDominance = useMemo(() => {
    if (!quotes) return null;
    const btcCap = quotes['BTC-USD']?.marketCap || 0;
    const totalCap = CRYPTO.reduce((sum, sym) => sum + (quotes[sym]?.marketCap || 0), 0);
    return totalCap > 0 ? ((btcCap / totalCap) * 100).toFixed(1) : null;
  }, [quotes]);

  return (
    <div className="space-y-6">
      <h1 className="text-sm font-mono text-terminal-accent uppercase tracking-wider">Cryptocurrency</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* BTC Price */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <div className="text-[10px] font-mono text-terminal-text-secondary uppercase tracking-wider mb-1">Bitcoin</div>
          <div className="font-mono text-2xl font-bold text-terminal-text">
            ${quotes?.['BTC-USD']?.regularMarketPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '—'}
          </div>
          <div className={`font-mono text-sm ${
            (quotes?.['BTC-USD']?.regularMarketChangePercent || 0) >= 0
              ? 'text-terminal-green' : 'text-terminal-red'
          }`}>
            {(quotes?.['BTC-USD']?.regularMarketChangePercent || 0) >= 0 ? '+' : ''}
            {quotes?.['BTC-USD']?.regularMarketChangePercent?.toFixed(2) || '0.00'}%
          </div>
        </div>

        {/* BTC Dominance */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <div className="text-[10px] font-mono text-terminal-text-secondary uppercase tracking-wider mb-1">BTC Dominance</div>
          <div className="font-mono text-2xl font-bold text-terminal-accent">
            {btcDominance ? btcDominance + '%' : '—'}
          </div>
          <div className="text-xs text-terminal-text-secondary">of tracked crypto market cap</div>
        </div>

        {/* Fear & Greed */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <div className="text-[10px] font-mono text-terminal-text-secondary uppercase tracking-wider mb-1">Fear & Greed Index</div>
          <a
            href="https://alternative.me/crypto/fear-and-greed-index/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-terminal-accent hover:underline"
          >
            View on alternative.me →
          </a>
          <div className="text-[10px] text-terminal-text-secondary mt-1">External data source</div>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-terminal-card border border-terminal-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between py-2 px-4 border-b border-terminal-border bg-terminal-surface">
          <div className="flex items-center gap-4 flex-1">
            <span className="font-mono text-[10px] text-terminal-text-secondary uppercase w-12">Ticker</span>
            <span className="font-mono text-[10px] text-terminal-text-secondary uppercase">Name</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] text-terminal-text-secondary uppercase w-[60px]">7D</span>
            <span className="font-mono text-[10px] text-terminal-text-secondary uppercase w-24 text-right">Price</span>
            <span className="font-mono text-[10px] text-terminal-text-secondary uppercase w-16 text-right">24h</span>
            <span className="font-mono text-[10px] text-terminal-text-secondary uppercase w-24 text-right">Mkt Cap</span>
          </div>
        </div>
        <div className="divide-y divide-terminal-border">
          {CRYPTO.map((symbol) => (
            <CryptoRow
              key={symbol}
              symbol={symbol}
              quote={quotes?.[symbol]}
              isStablecoin={STABLECOINS.includes(symbol)}
              onClick={() => openModal(symbol)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
