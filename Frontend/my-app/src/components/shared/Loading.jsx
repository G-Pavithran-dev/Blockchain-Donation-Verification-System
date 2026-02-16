import { Skeleton } from '@/components/ui/skeleton';

export function Loading({ count = 3, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-9 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return <Skeleton className="h-40 w-full" />;
}
