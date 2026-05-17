import { DataTableSurface, Skeleton } from '@/shared/ui'

export function ClientsTableSkeleton() {
  return (
    <DataTableSurface>
      <Skeleton className="h-target rounded-none border-b border-separator bg-surface-subtle" />
      <div className="divide-y divide-separator">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="grid grid-cols-[minmax(280px,1.4fr)_minmax(170px,0.8fr)_minmax(220px,1fr)_minmax(140px,0.7fr)_140px] items-center gap-component px-component py-control" key={index}>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-control" />
              <div className="grid gap-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-28 rounded-full" />
            <div className="grid gap-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
    </DataTableSurface>
  )
}
