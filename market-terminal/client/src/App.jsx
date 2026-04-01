import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import useStore from './store/useStore';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import TradingViewModal from './components/TradingViewModal';
import Overview from './views/Overview';
import Heatmap from './views/Heatmap';
import Indices from './views/Indices';
import Sectors from './views/Sectors';
import Energy from './views/Energy';
import CommoditiesPage from './views/Commodities';
import FxRates from './views/FxRates';
import CryptoPage from './views/Crypto';
import Screener from './views/Screener';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

function AppLayout() {
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (key === 'd' || key === 'l') {
        useStore.getState().toggleTheme();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/indices" element={<Indices />} />
            <Route path="/sectors" element={<Sectors />} />
            <Route path="/energy" element={<Energy />} />
            <Route path="/commodities" element={<CommoditiesPage />} />
            <Route path="/fx-rates" element={<FxRates />} />
            <Route path="/crypto" element={<CryptoPage />} />
            <Route path="/screener" element={<Screener />} />
          </Routes>
        </main>
      </div>
      <TradingViewModal />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
