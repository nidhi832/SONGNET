import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "Failed to load audio stream or content metadata. Please check your connection and try again.",
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-card/40 border border-white/10 backdrop-blur-xl my-8 space-y-4 max-w-lg mx-auto animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-lg shadow-accent/20">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-xs flex items-center gap-2 shadow-lg hover:shadow-accent/25 hover:scale-105 active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
