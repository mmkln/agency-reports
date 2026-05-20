import { PageShell } from '@/shared/ui'

import {
  ClinicReportingHeader,
  ClinicReportingState,
  CompactMetricGrid,
  MetricCards,
  NarrativeBlock,
  TrendPanel,
  TrustStrip,
} from './ClinicReportingBlocks'
import { DecisionPanel } from './DashboardInsightSections'

export function MonthlyStrategyDashboard({ page }) {
  if (page.status === 'error' || !page.period) {
    return <ClinicReportingState page={page} />
  }

  const content = page.period.content ?? {}

  return (
    <PageShell className="py-section" width="full">
      <ClinicReportingHeader eyebrow="Monthly strategy" page={page} title="Finance And Strategy Dashboard" />
      <NarrativeBlock narrative={content.narrative} title="Strategic Decisions" />
      <DecisionPanel decisions={content.narrative?.decisions_needed} title="Strategic Decisions Needed" />
      <MetricCards items={content.financials} title="Monthly Financials" />
      <div className="grid gap-card xl:grid-cols-2">
        <CompactMetricGrid items={content.unit_economics} title="Unit Economics" />
        <CompactMetricGrid items={content.retention} title="Retention And Cohorts" />
      </div>
      <TrendPanel items={content.trends} title="12-Month Channel And Practice Trends" />
      <TrustStrip sources={page.period.source_trust} />
    </PageShell>
  )
}
