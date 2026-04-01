# The Terminal — Market Command Center

A comprehensive real-time market intelligence dashboard covering every major public market. Built with React + Vite + Tailwind CSS on the frontend and Node.js + Express on the backend.

## Features

- **AI Executive Summary** — Claude-powered morning market briefing
- **Market Heatmap** — Full S&P 500 treemap colored by performance
- **Global Indices** — US, International, and Volatility tracking
- **Sector Analysis** — All 11 GICS sectors with rotation chart
- **Energy Command Center** — Deep-dive into oil, gas, nuclear, and clean energy
- **Commodities** — Precious metals, industrial metals, agriculture
- **FX & Rates** — Foreign exchange pairs, bond yields, yield curve visualizer
- **Crypto** — Top 20 cryptocurrencies with BTC dominance
- **Screener** — Sortable, filterable table with CSV export

## Quick Start

```bash
# Install all dependencies
cd market-terminal
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Add your Anthropic API key (optional — for AI summary)
echo "ANTHROPIC_API_KEY=your_key_here" > server/.env

# Start backend (port 3001)
cd server && node index.js

# Start frontend (port 5173) — in a new terminal
cd client && npm run dev

# Open http://localhost:5173
```

## Stack

- **Frontend:** React 18, Vite, Tailwind CSS, TradingView Lightweight Charts, Recharts, Zustand, React Query
- **Backend:** Node.js, Express, yahoo-finance2, node-cache
- **AI:** Anthropic Claude API (optional)

## Keyboard Shortcuts

- `D` / `L` — Toggle dark/light mode
