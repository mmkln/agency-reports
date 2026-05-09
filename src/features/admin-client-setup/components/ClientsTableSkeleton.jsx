import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ClientsTableSkeleton() {
  return (
    <Card className="border-slate-200 bg-white py-0 shadow-xs">
      <Skeleton className="h-12 rounded-none border-b border-slate-200 bg-slate-50" />
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="grid grid-cols-[minmax(280px,1.4fr)_minmax(170px,0.8fr)_minmax(220px,1fr)_minmax(140px,0.7fr)_140px] items-center gap-6 px-6 py-5" key={index}>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
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
    </Card>
  )
}
