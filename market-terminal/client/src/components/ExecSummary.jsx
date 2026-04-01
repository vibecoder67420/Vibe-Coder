import { RefreshCw, Brain } from 'lucide-react';
import { useSummary } from '../hooks/useMarketData';
import { useQueryClient } from '@tanstack/react-query';

export default function ExecSummary() {
  const { data, isLoading, isError } = useSummary();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['summary'] });
  };

  if (isLoading) {
    return (
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-terminal-accent/5 via-terminal-accent/10 to-terminal-accent/5 rounded-lg" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} className="text-terminal-accent animate-pulse" />
            <span className="text-sm font-mono text-terminal-accent uppercase tracking-wider">AI Executive Summary</span>
          </div>
          <div className="space-y-3">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-11/12" />
            <div className="skeleton h-4 w-10/12" />
            <div className="skeleton h-4 w-9/12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-terminal-card border border-terminal-border rounded-lg p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-terminal-accent/5 via-transparent to-terminal-accent/5 rounded-lg" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-terminal-accent" />
            <span className="text-sm font-mono text-terminal-accent uppercase tracking-wider">
              AI Executive Summary
            </span>
            {data?.isPlaceholder && (
              <span className="text-[10px] bg-terminal-energy/20 text-terminal-energy px-2 py-0.5 rounded font-mono">
                NO API KEY
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {data?.timestamp && (
              <span className="text-[10px] text-terminal-text-secondary font-mono">
                Updated {new Date(data.timestamp).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded hover:bg-terminal-surface text-terminal-text-secondary hover:text-terminal-accent transition-colors"
              title="Refresh summary"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-terminal-text">
          {data?.summary || (isError ? 'Unable to load summary.' : '')}
        </p>
      </div>
    </div>
  );
}
