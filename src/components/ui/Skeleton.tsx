/* Skeleton loader — drop-in replacement for .sk */
interface SkeletonProps { className?: string; }

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`sk ${className}`} aria-hidden="true" />;
}

export function SkeletonCard() {
  return (
    <div className="card p-6 space-y-4" aria-hidden="true">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-[18px]" aria-hidden="true">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-2 w-1/5" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
