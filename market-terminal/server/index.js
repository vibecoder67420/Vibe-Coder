import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import YahooFinance from 'yahoo-finance2';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const cache = new NodeCache({ stdTTL: 15 });

const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// yahoo-finance2 v2 exports a class
const yf = new YahooFinance();

// Helper: fetch quote with caching
async function getQuotes(symbols) {
  const results = {};
  const uncached = [];

  for (const sym of symbols) {
    const cached = cache.get(`quote:${sym}`);
    if (cached) {
      results[sym] = cached;
    } else {
      uncached.push(sym);
    }
  }

  if (uncached.length > 0) {
    const promises = uncached.map(async (sym) => {
      try {
        const quote = await yf.quote(sym);
        cache.set(`quote:${sym}`, quote);
        results[sym] = quote;
      } catch (err) {
        console.error(`Failed to fetch quote for ${sym}:`, err.message);
        results[sym] = null;
      }
    });
    await Promise.all(promises);
  }

  return results;
}

// Helper: fetch chart data directly from Yahoo Finance v8 API
async function fetchChart(symbol, range = '1mo', interval = '1d') {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  if (!res.ok) throw new Error(`Yahoo chart API returned ${res.status}`);
  const json = await res.json();
  const result = json.chart?.result?.[0];
  if (!result) throw new Error('No chart data');

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const opens = result.indicators?.quote?.[0]?.open || [];
  const highs = result.indicators?.quote?.[0]?.high || [];
  const lows = result.indicators?.quote?.[0]?.low || [];
  const volumes = result.indicators?.quote?.[0]?.volume || [];

  return timestamps.map((t, i) => ({
    time: t,
    open: opens[i],
    high: highs[i],
    low: lows[i],
    close: closes[i],
    volume: volumes[i],
  })).filter((d) => d.close !== null && d.close !== undefined);
}

// GET /api/quotes?symbols=SPY,QQQ,IWM
app.get('/api/quotes', async (req, res) => {
  try {
    const symbols = (req.query.symbols || '').split(',').filter(Boolean);
    if (symbols.length === 0) return res.json({});

    // Process in batches of 20
    const batchSize = 20;
    const allResults = {};

    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const batchResults = await getQuotes(batch);
      Object.assign(allResults, batchResults);
    }

    res.json(allResults);
  } catch (err) {
    console.error('Quotes error:', err.message);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// GET /api/history?symbol=SPY&range=1y
app.get('/api/history', async (req, res) => {
  try {
    const { symbol, range = '1y' } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol required' });

    const cacheKey = `history:${symbol}:${range}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const rangeMap = {
      '1d': { range: '1d', interval: '5m' },
      '1w': { range: '5d', interval: '15m' },
      '1m': { range: '1mo', interval: '1d' },
      '3m': { range: '3mo', interval: '1d' },
      'ytd': { range: 'ytd', interval: '1d' },
      '1y': { range: '1y', interval: '1wk' },
      '5y': { range: '5y', interval: '1mo' },
    };

    const config = rangeMap[range] || rangeMap['1y'];
    const data = await fetchChart(symbol, config.range, config.interval);

    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/sparkline?symbol=SPY&range=1w
app.get('/api/sparkline', async (req, res) => {
  try {
    const { symbol, range = '1w' } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol required' });

    const cacheKey = `sparkline:${symbol}:${range}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const rangeMap = {
      '1d': { range: '1d', interval: '5m' },
      '1w': { range: '5d', interval: '30m' },
      '1m': { range: '1mo', interval: '1d' },
      '3m': { range: '3mo', interval: '1d' },
      'ytd': { range: 'ytd', interval: '1d' },
      '1y': { range: '1y', interval: '1wk' },
      '5y': { range: '5y', interval: '1mo' },
    };

    const config = rangeMap[range] || rangeMap['5d'];
    const chartData = await fetchChart(symbol, config.range, config.interval);
    const data = chartData.map((d) => ({ time: d.time, value: d.close }));

    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('Sparkline error:', err.message);
    res.status(500).json({ error: 'Failed to fetch sparkline' });
  }
});

// GET /api/movers
app.get('/api/movers', async (req, res) => {
  try {
    const cacheKey = 'movers';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const watchlist = [
      'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AVGO',
      'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA',
      'UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'PFE',
      'XOM', 'CVX', 'COP', 'EOG', 'SLB',
      'HD', 'WMT', 'COST', 'MCD', 'NKE',
      'BX', 'BLK', 'KKR', 'APO',
      'CCJ', 'ENPH', 'FSLR', 'NEE',
      'SPY', 'QQQ', 'IWM',
    ];

    const quotes = await getQuotes(watchlist);
    const valid = Object.entries(quotes)
      .filter(([, q]) => q && q.regularMarketChangePercent != null)
      .map(([sym, q]) => ({
        symbol: sym,
        name: q.shortName || q.longName || sym,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        sector: q.sector || '',
      }));

    valid.sort((a, b) => b.changePercent - a.changePercent);

    const result = {
      gainers: valid.slice(0, 5),
      losers: valid.slice(-5).reverse(),
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Movers error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movers' });
  }
});

// GET /api/summary
app.get('/api/summary', async (req, res) => {
  try {
    const cacheKey = 'summary';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const keySymbols = [
      'SPY', 'QQQ', 'IWM', 'DIA', '^TNX', '^VIX',
      'GLD', 'CL=F', 'DX-Y.NYB', 'TLT',
      'XLK', 'XLF', 'XLV', 'XLE', 'XLI', 'XLU',
      'AAPL', 'MSFT', 'NVDA', 'TSLA',
    ];

    const quotes = await getQuotes(keySymbols);
    const marketData = Object.entries(quotes)
      .filter(([, q]) => q)
      .map(([sym, q]) => ({
        symbol: sym,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        name: q.shortName || sym,
      }));

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_key_here') {
      const result = {
        summary: "AI Executive Summary unavailable — please set your ANTHROPIC_API_KEY in server/.env to enable AI-powered market briefings. Market data is still being fetched and displayed across all pages.",
        timestamp: new Date().toISOString(),
        isPlaceholder: true,
      };
      cache.set(cacheKey, result);
      return res.json(result);
    }

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `You are a concise Wall Street morning briefing analyst. Given the following market data:\n\n${JSON.stringify(marketData, null, 2)}\n\nWrite a 4-sentence executive summary covering: (1) overnight/premarket action, (2) sector leadership and laggards, (3) macro signals from bonds/FX/commodities, (4) one risk or catalyst to watch. Be direct, data-driven, and specific. No fluff.`,
      }],
    });

    const result = {
      summary: message.content[0].text,
      timestamp: new Date().toISOString(),
      isPlaceholder: false,
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Summary error:', err.message);
    res.status(500).json({
      summary: 'Unable to generate AI summary at this time.',
      timestamp: new Date().toISOString(),
      isPlaceholder: true,
    });
  }
});

// GET /api/news?symbol=SPY
app.get('/api/news', async (req, res) => {
  try {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol required' });

    const cacheKey = `news:${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Use autoc for search since this version doesn't have search()
    try {
      const result = await yf.autoc(symbol);
      res.json(result?.Result?.slice(0, 10) || []);
    } catch {
      res.json([]);
    }
  } catch (err) {
    console.error('News error:', err.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.listen(PORT, () => {
  console.log(`Market Terminal API running on port ${PORT}`);
});
