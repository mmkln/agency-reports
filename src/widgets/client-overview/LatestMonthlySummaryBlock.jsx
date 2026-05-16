import { Link } from 'react-router-dom'

import { Button, Separator } from '@/shared/ui'
import { Icon } from '@/shared/icons'

import { EmptyState, SectionCard } from './_shared'
import { formatDate } from './formatters'

export function LatestMonthlySummaryBlock({ clientId, report }) {
  return (
    <SectionCard iconName="fileText" title="Latest report">
      {report ? (
        <article className="rounded-control border border-control-border bg-block-subtle p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-text-primary">{report.title}</h3>
              <p className="mt-2 text-label font-normal text-text-muted">
                {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
              </p>
            </div>
            <Icon className="text-destructive" name="fileText" size={22} />
          </div>
          <p className="mt-4 text-body text-text-secondary">{report.summary}</p>
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to={`/client/reports?clientId=${clientId}&reportId=${report.id}`}>
                Read Report
              </Link>
            </Button>
            {report.dashboardUrl ? (
              <Button asChild size="sm" variant="outline">
                <a href={report.dashboardUrl} rel="noreferrer" target="_blank">
                  Open Dashboard
                </a>
              </Button>
            ) : null}
            {report.pdfUrl ? (
              <Button asChild size="sm" variant="outline">
                <a href={report.pdfUrl} rel="noreferrer" target="_blank">
                  Open PDF
                </a>
              </Button>
            ) : null}
          </div>
        </article>
      ) : (
        <EmptyState>No published report yet.</EmptyState>
      )}
    </SectionCard>
  )
}
