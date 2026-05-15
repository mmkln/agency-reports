import { PrimitiveCard as Card, Skeleton } from '@/shared/ui'

export function PerformanceDashboardsTableSkeleton() {
  return (
    <Card className="border-control-border bg-block py-0 shadow-none">
      <div className="border-b border-control-border bg-surface-subtle px-6 py-3">
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="divide-y divide-separator">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="grid grid-cols-[1.7fr_1fr_1fr_0.7fr_1fr_0.8fr_0.5fr] gap-6 px-6 py-4" key={index}>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-8 w-20 justify-self-end" />
          </div>
        ))}
      </div>
    </Card>
  )
}
