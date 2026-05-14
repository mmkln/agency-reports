import { PrimitiveCard as Card, Skeleton } from '@/shared/ui'

export function ReportsTableSkeleton() {
  return (
    <Card className="border-control-border bg-block p-0 shadow-none">
      <div className="border-b border-control-border bg-surface-subtle px-6 py-4">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="divide-y divide-separator">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="grid grid-cols-[1.5fr_1fr_1fr_.75fr_.75fr] gap-6 px-6 py-5" key={index}>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </Card>
  )
}
