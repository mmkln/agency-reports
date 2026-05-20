import { PageShell } from '@/shared/ui'

import {
  ChannelTable,
  ClinicReportingHeader,
  ClinicReportingState,
  CompactMetricGrid,
  MetricCards,
  NarrativeBlock,
  TrendPanel,
  TrustStrip,
} from './ClinicReportingBlocks'
import {
  DecisionPanel,
  FocusSummaryPanel,
} from './DashboardInsightSections'

export function ExecutivePerformanceDashboard({ page }) {
  if (page.status === 'error' || !page.period) {
    return <ClinicReportingState page={page} />
  }

  const content = page.period.content ?? {}

  return (
    <PageShell className="py-section" width="full">
      <ClinicReportingHeader eyebrow="Executive performance" page={page} title="Clinic Executive Dashboard" />
      <NarrativeBlock narrative={content.narrative} title="Executive Narrative" />
      <FocusSummaryPanel narrative={content.narrative} title="Executive Focus" />
      <MetricCards items={content.hero_metrics} title="Business Outcome Scoreboard" />
      <div className="grid gap-card xl:grid-cols-[1fr_0.9fr]">
        <TrendPanel items={content.trends} title="Performance Trends" />
        <CompactMetricGrid items={content.practice_quality} title="Practice Quality" />
      </div>
      <ChannelTable items={content.channel_performance} title="Channel ROI" />
      <DecisionPanel decisions={content.narrative?.decisions_needed} />
      <TrustStrip sources={page.period.source_trust} />
    </PageShell>
  )
}
