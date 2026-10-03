import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'track' | 'artist' | 'hero';
}

export const SkeletonCardGrid: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-2xl bg-card/60 border border-white/5 space-y-3 animate-pulse"
        >
          <div className="aspect-square w-full rounded-xl bg-white/10" />
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonTrackList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-xl bg-card/40 border border-white/5 animate-pulse"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-4 h-4 bg-white/10 rounded shrink-0" />
            <div className="w-11 h-11 bg-white/10 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1 max-w-xs">
              <div className="h-4 bg-white/10 rounded w-2/3" />
              <div className="h-3 bg-white/5 rounded w-1/3" />
            </div>
          </div>
          <div className="h-3 bg-white/5 rounded w-12" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 5, type = 'card' }) => {
  if (type === 'track') {
    return <SkeletonTrackList count={count} />;
  }
  return <SkeletonCardGrid count={count} />;
};

export default SkeletonLoader;
