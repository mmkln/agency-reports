import { Link } from 'react-router-dom'

import { Button, StatusBadge } from '@/shared/ui'

import { EmptyState, SectionCard } from './_shared'
import { formatDate, formatMetricValue } from './formatters'

export function PerformanceOverviewBlock({ clientId, hrefBase = '/client/performance', preview }) {
  const heroMetric = preview?.heroMetric
  const kpiCards = preview?.kpiCards ?? []
  const showConfidenceWarning = preview?.dataConfidence === 'low' || preview?.dataConfidence === 'estimated'

  return (
    <SectionCard
      description="Business-value analytics published by the agency."
      iconName="barChart"
      title="Performance snapshot"
    >
      {preview ? (
        <div className="grid gap-4">
          <div className="rounded-control border border-control-border bg-block-subtle p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-label uppercase text-text-muted">Hero metric</p>
                <h3 className="mt-2 text-data text-text-primary">
                  {formatMetricValue(heroMetric)}
                </h3>
                <p className="mt-1 text-ui text-text-secondary">{heroMetric?.label || preview.title}</p>
              </div>
              <StatusBadge meta={preview.dataConfidenceMeta} />
            </div>
            <p className="mt-3 text-label font-normal text-text-muted">
              Last updated {formatDate(preview.lastUpdatedAt)}
            </p>
          </div>

          {kpiCards.length > 0 ? (
            <div className="grid gap-2">
              {kpiCards.map((metric) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-control border border-control-border bg-block px-3 py-2"
                  key={metric.id || metric.name}
                >
                  <span className="truncate text-ui text-text-secondary">{metric.name}</span>
                  <span className="shrink-0 text-ui text-text-primary">{formatMetricValue(metric)}</span>
                </div>
              ))}
            </div>
          ) : null}

          {showConfidenceWarning ? (
            <p className="rounded-control border border-warning/20 bg-warning-muted px-3 py-2 text-body text-warning-foreground">
              Review this period with context. The agency marked this dashboard as {preview.dataConfidenceMeta?.label?.toLowerCase()}.
            </p>
          ) : null}

          <Button asChild className="w-full" size="lg">
            <Link to={`${hrefBase}?clientId=${clientId}&performancePeriodId=${preview.id}`}>
              View Performance Dashboard
            </Link>
          </Button>
        </div>
      ) : (
        <EmptyState iconName="barChart">
          Performance dashboard is being prepared. Published analytics will appear here after agency review.
        </EmptyState>
      )}
    </SectionCard>
  )
}
