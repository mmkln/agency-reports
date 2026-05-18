import {
  Panel,
  PanelBody,
  StatusBadge,
} from '@/shared/ui'

import { formatPeriod } from './formatters'

export function ResultsHeader({ page }) {
  const dashboard = page.performancePage.performanceDashboard
  const latestReport = page.reportsPage.latestReport
  const sourceDashboard = page.dashboardPage.dashboard

  return (
    <Panel>
      <PanelBody className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <p className="text-label text-text-muted">{page.copy.headerEyebrow}</p>
          <h2 className="mt-2 text-heading text-text-primary">{page.client.name}</h2>
          <p className="mt-2 max-w-readable text-body text-text-secondary">
            {page.copy.headerDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-tag lg:justify-end">
          {dashboard?.dataConfidenceMeta ? <StatusBadge meta={dashboard.dataConfidenceMeta} /> : null}
          {dashboard?.dataModeMeta ? <StatusBadge meta={dashboard.dataModeMeta} /> : null}
          {sourceDashboard?.statusMeta ? <StatusBadge meta={sourceDashboard.statusMeta} /> : null}
        </div>
      </PanelBody>
      <PanelBody className="grid gap-3 border-t border-separator md:grid-cols-3">
        <div>
          <p className="text-label text-text-muted">Current period</p>
          <p className="mt-1 text-ui text-text-primary">
            {dashboard ? formatPeriod(dashboard) : 'Performance period pending'}
          </p>
        </div>
        <div>
          <p className="text-label text-text-muted">Source dashboard</p>
          <p className="mt-1 text-ui text-text-primary">
            {sourceDashboard?.name ?? 'Not published yet'}
          </p>
        </div>
        <div>
          <p className="text-label text-text-muted">Latest report</p>
          <p className="mt-1 text-ui text-text-primary">
            {latestReport ? latestReport.title : 'No published report yet'}
          </p>
        </div>
      </PanelBody>
    </Panel>
  )
}
