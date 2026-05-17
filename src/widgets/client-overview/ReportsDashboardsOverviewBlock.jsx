import { Link } from 'react-router-dom'

import {
  Button,
  StatusBadge,
} from '@/shared/ui'

import { EmptyState, SectionCard } from './_shared'
import { formatDate, formatMetricValue } from './formatters'

function SummaryRow({ label, value }) {
  return (
    <div className="rounded-control bg-block-subtle px-3 py-2">
      <p className="text-label text-text-muted">{label}</p>
      <p className="mt-1 truncate text-ui text-text-primary">{value || 'Not published yet'}</p>
    </div>
  )
}

export function ReportsDashboardsOverviewBlock({
  clientId,
  dashboard,
  performancePreview,
  report,
}) {
  const heroMetric = performancePreview?.heroMetric

  return (
    <SectionCard
      action={(
        <Button asChild size="sm" variant="outline">
          <Link to={`/client/reports-dashboards?clientId=${clientId}`}>
            View results
          </Link>
        </Button>
      )}
      description="Performance interpretation, source dashboard, and published reports."
      iconName="barChart"
      title="Reports & Dashboards"
    >
      {performancePreview || dashboard || report ? (
        <div className="grid gap-3">
          {performancePreview ? (
            <div className="rounded-control border border-control-border bg-block-subtle p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-label text-text-muted">Current performance</p>
                  <p className="mt-2 text-data text-text-primary">{formatMetricValue(heroMetric)}</p>
                  <p className="mt-1 truncate text-ui text-text-secondary">
                    {heroMetric?.label || performancePreview.title}
                  </p>
                </div>
                {performancePreview.dataConfidenceMeta ? (
                  <StatusBadge meta={performancePreview.dataConfidenceMeta} />
                ) : null}
              </div>
              <p className="mt-3 text-label font-normal text-text-muted">
                Updated {formatDate(performancePreview.lastUpdatedAt)}
              </p>
            </div>
          ) : null}

          <SummaryRow label="Source dashboard" value={dashboard?.name} />
          <SummaryRow label="Latest report" value={report?.title} />
        </div>
      ) : (
        <EmptyState iconName="barChart">
          Reports and dashboards are being prepared. Published results will appear here after agency review.
        </EmptyState>
      )}
    </SectionCard>
  )
}
