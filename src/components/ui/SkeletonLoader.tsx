/**
 * SkeletonLoader Component
 * 
 * Reusable skeleton loading components for async data states.
 * Provides consistent loading experience across the application.
 */

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-white/10 rounded-lg ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
      
      <div className="space-y-3 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      
      <div className="pt-4 border-t border-white/10">
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl">
      <Skeleton className="h-6 w-1/3 mb-6" />
      
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 sm:p-4 bg-white/5 rounded-xl">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-20 h-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl">
      <Skeleton className="h-4 w-1/2 mb-3" />
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl">
      <Skeleton className="h-6 w-1/3 mb-6" />
      <div className="space-y-4">
        <div className="flex items-end gap-2 h-48">
          {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
            <Skeleton 
              key={i} 
              className="flex-1" 
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonNFT() {
  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <Skeleton className="w-full aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-3 w-full sm:w-auto">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStat key={i} />
        ))}
      </div>
      
      {/* Content Skeleton */}
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
