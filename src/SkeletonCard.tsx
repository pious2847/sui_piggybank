import { memo } from "react";

interface SkeletonCardProps {
  variant?: 'bank' | 'stats' | 'details' | 'list' | 'chart' | 'stat';
}

export const SkeletonCard = memo(function SkeletonCard({ variant = 'bank' }: SkeletonCardProps) {
  if (variant === 'bank') {
    return (
      <div className="relative p-5 rounded-2xl border border-white/10 bg-white/5 animate-pulse">
        <div className="flex items-center gap-4">
          {/* Icon skeleton */}
          <div className="w-12 h-12 bg-white/10 rounded-full" />
          
          {/* Text skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-white/10 rounded w-24" />
            <div className="h-4 bg-white/10 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'stats') {
    return (
      <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-8 shadow-2xl animate-pulse">
        <div className="text-center space-y-3">
          {/* Icon skeleton */}
          <div className="w-12 h-12 bg-white/10 rounded-full mx-auto" />
          
          {/* Label skeleton */}
          <div className="h-3 bg-white/10 rounded w-24 mx-auto" />
          
          {/* Value skeleton */}
          <div className="h-8 bg-white/10 rounded w-16 mx-auto" />
        </div>
      </div>
    );
  }

  if (variant === 'details') {
    return (
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full" />
            <div className="h-5 bg-white/10 rounded w-32" />
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="h-8 bg-white/10 rounded w-40" />
            <div className="h-4 bg-white/10 rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl animate-pulse">
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="h-6 bg-white/10 rounded w-48" />
          
          {/* List items skeleton */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-32" />
                  <div className="h-3 bg-white/10 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl animate-pulse">
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="h-6 bg-white/10 rounded w-48" />
          
          {/* Chart skeleton */}
          <div className="h-80 bg-white/5 rounded-xl flex items-end gap-2 p-4">
            {[40, 60, 45, 70, 55, 80, 65, 75, 60, 85].map((height, i) => (
              <div 
                key={i} 
                className="flex-1 bg-white/10 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'stat') {
    return (
      <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6 shadow-2xl animate-pulse">
        <div className="text-center space-y-3">
          {/* Icon skeleton */}
          <div className="w-12 h-12 bg-white/10 rounded-full mx-auto" />
          
          {/* Label skeleton */}
          <div className="h-3 bg-white/10 rounded w-24 mx-auto" />
          
          {/* Value skeleton */}
          <div className="h-8 bg-white/10 rounded w-16 mx-auto" />
        </div>
      </div>
    );
  }

  return null;
});
