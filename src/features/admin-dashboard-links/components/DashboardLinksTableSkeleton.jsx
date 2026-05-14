import {
  PrimitiveCard as Card,
  Skeleton,
} from '@/shared/ui'

export function DashboardLinksTableSkeleton() {
  return (
    <Card className="border-control-border bg-block py-0 shadow-none">
      <div className="border-b border-separator bg-surface-subtle px-6 py-4">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="divide-y divide-separator">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr_0.8fr_0.7fr] gap-6 px-6 py-5" key={index}>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20 justify-self-end" />
          </div>
        ))}
      </div>
    </Card>
  )
}
