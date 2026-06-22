import { Skeleton } from '@/shared/ui'

const activityCardPlaceholders = Array.from({ length: 6 })
const lifecycleStepPlaceholders = Array.from({ length: 5 })

export function DentalGrowthReviewSkeleton() {
  return (
    <div className="grid gap-card">
      <ReactivationActivitySkeleton />
      <LifecycleFunnelSkeleton />
    </div>
  )
}

function ReactivationActivitySkeleton() {
  return (
    <section className="rounded-block bg-block p-component">
      <div className="flex min-w-0 items-start justify-between gap-control">
        <div className="grid gap-tag">
          <Skeleton className="h-control w-44" />
          <Skeleton className="h-control-small w-72 max-w-full" />
        </div>
        <Skeleton className="h-control-small w-24" />
      </div>

      <div className="mt-component grid gap-control md:grid-cols-3 xl:grid-cols-6">
        {activityCardPlaceholders.map((_, index) => (
          <div className="grid gap-tag rounded-item bg-fill-secondary p-control" key={`reactivation-activity-card-skeleton-${index}`}>
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-control-small w-24" />
          </div>
        ))}
      </div>

      <Skeleton className="mt-component h-[320px] w-full rounded-block" />
    </section>
  )
}

function LifecycleFunnelSkeleton() {
  return (
    <section className="rounded-block bg-block p-component">
      <Skeleton className="h-control w-48" />

      <div className="mt-card grid gap-control md:grid-cols-5">
        {lifecycleStepPlaceholders.map((_, index) => (
          <div className="grid justify-items-center gap-tag" key={`reactivation-lifecycle-step-skeleton-${index}`}>
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-control-small w-24" />
          </div>
        ))}
      </div>

      <Skeleton className="mt-component h-[260px] w-full rounded-block" />
    </section>
  )
}
