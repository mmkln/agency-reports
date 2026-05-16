import { Link } from 'react-router-dom'

import { Button, StatusBadge } from '@/shared/ui'

import { EmptyState, SectionCard } from './_shared'

export function DashboardOverviewBlock({ clientId, dashboard, hrefBase = '/client/dashboard' }) {
  return (
    <SectionCard
      description="Live performance data from the agency dashboard."
      iconName="layoutDashboard"
      title="Analytics dashboard"
    >
      {dashboard ? (
        <div className="grid gap-4">
          <div className="rounded-control border border-control-border bg-block-subtle p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-text-primary">{dashboard.name}</h3>
                <p className="mt-1 text-label font-normal text-text-muted">
                  {dashboard.isAvailable ? 'Ready to view' : 'Temporarily unavailable'}
                </p>
              </div>
              <StatusBadge meta={dashboard.statusMeta} />
            </div>
          </div>

          {!dashboard.isAvailable ? (
            <p className="rounded-control border border-warning/20 bg-warning-muted px-3 py-2 text-body text-warning-foreground">
              {dashboard.fallbackMessage || 'Dashboard is temporarily unavailable.'}
            </p>
          ) : null}

          <div className="grid gap-2">
            <Button asChild className="w-full" size="lg">
              <Link to={`${hrefBase}?clientId=${clientId}&dashboardId=${dashboard.id}`}>
                View Dashboard
              </Link>
            </Button>
            {dashboard.publicUrl ? (
              <Button asChild className="w-full" size="lg" variant="outline">
                <a href={dashboard.publicUrl} rel="noreferrer" target="_blank">
                  Open Full Dashboard
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <EmptyState iconName="layoutDashboard">
          Dashboard is being prepared. Expected availability will be shared by your agency manager.
        </EmptyState>
      )}
    </SectionCard>
  )
}
