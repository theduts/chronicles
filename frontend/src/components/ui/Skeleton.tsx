import React from 'react';

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-container-high/40 rounded-none ${className}`}
    />
  );
}

export function CharacterCardSkeleton() {
  return (
    <div className="relative bg-surface-container border border-outline-variant flex flex-col h-[480px] overflow-hidden p-0">
      {/* Upper image silhouette */}
      <SkeletonBlock className="w-full h-64 shrink-0 bg-surface-container-high/40" />

      {/* Card body silhouette */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Title line (~75% width) */}
          <SkeletonBlock className="h-5 w-3/4 bg-surface-container-high/50" />
          {/* Subtitle / class / race line */}
          <SkeletonBlock className="h-3 w-1/2 bg-surface-container-high/30" />
        </div>

        {/* Bottom stats / metadata lines */}
        <div className="space-y-2 pt-2 border-t border-outline-variant/30">
          <SkeletonBlock className="h-3 w-2/3 bg-surface-container-high/30" />
          <SkeletonBlock className="h-3 w-1/3 bg-surface-container-high/30" />
        </div>
      </div>
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/50 p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Square avatar placeholder */}
        <SkeletonBlock className="w-14 h-14 shrink-0 bg-surface-container-high/40" />

        {/* Text lines */}
        <div className="space-y-2 flex-1 min-w-0">
          <SkeletonBlock className="h-4 w-48 bg-surface-container-high/50" />
          <SkeletonBlock className="h-3 w-32 bg-surface-container-high/30" />
        </div>
      </div>

      {/* Action buttons placeholder */}
      <div className="flex items-center gap-2 shrink-0">
        <SkeletonBlock className="w-20 h-8 bg-surface-container-high/30" />
        <SkeletonBlock className="w-20 h-8 bg-surface-container-high/30" />
      </div>
    </div>
  );
}
