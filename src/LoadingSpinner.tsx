import { memo } from "react";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner = memo(function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Main spinner */}
        <div 
          className={`animate-spin ${sizeClasses[size]} border-4 border-white/10 border-t-cyan-500 rounded-full`}
        />
        
        {/* Ping effect */}
        <div 
          className={`absolute inset-0 animate-ping ${sizeClasses[size]} border-4 border-cyan-500/20 rounded-full`}
        />
      </div>
      
      {/* Optional message */}
      {message && (
        <p className="mt-4 text-slate-400 text-sm animate-pulse" role="status" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
});
