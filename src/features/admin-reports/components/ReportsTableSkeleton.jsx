import { DataTableSurface, Skeleton } from '@/shared/ui'

export function ReportsTableSkeleton() {
  return (
    <DataTableSurface>
      <div className="border-b border-separator bg-surface-subtle px-component py-control">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="divide-y divide-separator">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="grid grid-cols-[1.5fr_1fr_1fr_.75fr_.75fr] gap-component px-component py-control" key={index}>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </DataTableSurface>
  )
}
