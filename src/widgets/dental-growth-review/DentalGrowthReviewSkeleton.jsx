import { Skeleton } from '@/shared/ui'

const heroMetricPlaceholders = Array.from({ length: 6 })
const funnelStepPlaceholders = Array.from({ length: 4 })

export function DentalGrowthReviewSkeleton() {
  return (
    <div className="grid gap-card">
      <section className="grid gap-control md:grid-cols-2 xl:grid-cols-3">
        {heroMetricPlaceholders.map((_, index) => (
          <MetricCardSkeleton key={`growth-review-metric-skeleton-${index}`} />
        ))}
      </section>

      <FunnelSkeleton />
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <article className="grid min-h-52 gap-component rounded-block bg-block p-component">
      <div className="flex min-w-0 items-start justify-between gap-control">
        <Skeleton className="h-control-small w-32" />
        <Skeleton className="h-control-small w-control-small rounded-full" />
      </div>

      <div className="grid gap-item">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-control-small w-36" />
      </div>

      <Skeleton className="h-16 w-44" />

      <div className="grid gap-tag">
        <div className="flex items-center justify-between gap-control">
          <Skeleton className="h-control-small w-24" />
          <Skeleton className="h-control-small w-12" />
        </div>
        <Skeleton className="h-tag w-full rounded-full" />
      </div>
    </article>
  )
}

function FunnelSkeleton() {
  return (
    <section className="rounded-block bg-block p-component">
      <Skeleton className="h-control w-40" />

      <div className="mt-card grid grid-cols-4 gap-control">
        {funnelStepPlaceholders.map((_, index) => (
          <div className="grid justify-items-center gap-tag" key={`growth-review-funnel-step-skeleton-${index}`}>
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-control-small w-24" />
          </div>
        ))}
      </div>

      <Skeleton className="mt-component h-[260px] w-full rounded-block" />
    </section>
  )
}
