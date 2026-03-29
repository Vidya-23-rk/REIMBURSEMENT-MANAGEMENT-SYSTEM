/**
 * Reusable skeleton loading components for professional loading states.
 */

interface SkeletonProps {
  className?: string;
}

export function SkeletonLine({ className = '' }: SkeletonProps) {
  return <div className={`skeleton h-4 rounded-lg ${className}`} />;
}

export function SkeletonCircle({ className = '' }: SkeletonProps) {
  return <div className={`skeleton w-10 h-10 rounded-full ${className}`} />;
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`card p-5 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonCircle className="w-9 h-9" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-3/4" />
          <SkeletonLine className="w-1/2 h-3" />
        </div>
      </div>
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-5/6" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-surface-100 bg-surface-50/50">
        {[...Array(5)].map((_, i) => (
          <SkeletonLine key={i} className="flex-1 h-3" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-4 border-b border-surface-50 last:border-0"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <SkeletonCircle className="w-8 h-8" />
          <SkeletonLine className="flex-1" />
          <SkeletonLine className="w-24" />
          <SkeletonLine className="w-16" />
          <SkeletonLine className="w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStatsRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <SkeletonCircle className="w-10 h-10 rounded-xl" />
          <SkeletonLine className="w-1/3 h-6" />
          <SkeletonLine className="w-2/3 h-3" />
        </div>
      ))}
    </div>
  );
}
