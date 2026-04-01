import { X } from 'lucide-react';
import useStore from '../store/useStore';

export default function TradingViewModal() {
  const { modalTicker, closeModal } = useStore();

  if (!modalTicker) return null;

  const widgetUrl = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(modalTicker)}&interval=D&theme=dark&style=1&locale=en&toolbar_bg=%23111118&enable_publishing=false&hide_top_toolbar=false&hide_side_toolbar=false&allow_symbol_change=true&save_image=false&container_id=tv-widget`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative w-full max-w-3xl bg-terminal-surface border-l border-terminal-border shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-terminal-border">
          <h2 className="font-mono text-lg font-semibold text-terminal-text">{modalTicker}</h2>
          <button
            onClick={closeModal}
            className="p-1 rounded hover:bg-terminal-card text-terminal-text-secondary hover:text-terminal-text"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-0">
          <iframe
            src={widgetUrl}
            className="w-full h-full border-0"
            title={`TradingView chart for ${modalTicker}`}
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
