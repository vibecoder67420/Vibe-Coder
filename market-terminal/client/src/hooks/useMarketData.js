import { useQuery } from '@tanstack/react-query';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useQuotes(symbols, options = {}) {
  return useQuery({
    queryKey: ['quotes', symbols.join(',')],
    queryFn: () => fetchJSON(`${API_BASE}/quotes?symbols=${symbols.join(',')}`),
    staleTime: 30_000,
    refetchInterval: 60_000,
    ...options,
  });
}

export function useHistory(symbol, range = '1y') {
  return useQuery({
    queryKey: ['history', symbol, range],
    queryFn: () => fetchJSON(`${API_BASE}/history?symbol=${symbol}&range=${range}`),
    staleTime: 60_000,
    enabled: !!symbol,
  });
}

export function useSparkline(symbol, range = '1w') {
  return useQuery({
    queryKey: ['sparkline', symbol, range],
    queryFn: () => fetchJSON(`${API_BASE}/sparkline?symbol=${symbol}&range=${range}`),
    staleTime: 60_000,
    enabled: !!symbol,
  });
}

export function useMovers() {
  return useQuery({
    queryKey: ['movers'],
    queryFn: () => fetchJSON(`${API_BASE}/movers`),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: () => fetchJSON(`${API_BASE}/summary`),
    staleTime: 300_000,
  });
}

export function useNews(symbol) {
  return useQuery({
    queryKey: ['news', symbol],
    queryFn: () => fetchJSON(`${API_BASE}/news?symbol=${symbol}`),
    staleTime: 120_000,
    enabled: !!symbol,
  });
}
