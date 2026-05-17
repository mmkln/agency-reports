import { Link } from 'react-router-dom'

import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { Icon } from '../../shared/icons'
import { formatPeriod } from './formatters'

function ReportArchiveItem({ clientId, report }) {
  return (
    <article className="rounded-block border border-control-border bg-block-subtle p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-ui text-text-primary">{report.title}</h3>
            <StatusBadge meta={report.statusMeta} />
          </div>
          <p className="mt-1 text-label font-normal text-text-muted">{formatPeriod(report)}</p>
          {report.summary ? (
            <p className="mt-2 line-clamp-3 text-body text-text-secondary">{report.summary}</p>
          ) : null}
        </div>
        <Button asChild className="shrink-0" size="sm" variant="outline">
          <Link to={`/client/reports-dashboards?clientId=${clientId}&reportId=${report.id}`}>
            Read report
            <Icon name="arrowRight" size={14} />
          </Link>
        </Button>
      </div>
    </article>
  )
}

export function ReportArchiveSection({ clientId, reportsPage }) {
  const reports = reportsPage.reports

  return (
    <Panel id="report-archive">
      <PanelHeader
        action={(
          reports.length ? (
            <Button asChild size="sm" variant="outline">
              <Link to={`/client/reports-dashboards?clientId=${clientId}#report-archive`}>
                Open archive
              </Link>
            </Button>
          ) : null
        )}
        subtitle="Published monthly and campaign summaries remain available here."
        title="Report Archive"
      />
      <PanelBody className="grid gap-3">
        {reports.length ? (
          reports.slice(0, 6).map((report) => (
            <ReportArchiveItem clientId={clientId} key={report.id} report={report} />
          ))
        ) : (
          <EmptyState
            description="The first report will appear here after the agency publishes it."
            iconName="fileText"
            title="No published reports yet"
          />
        )}
      </PanelBody>
    </Panel>
  )
}
