import { Link } from 'react-router-dom'

import { Button, PageShell } from '@/shared/ui'

import {
  ChannelTable,
  ClinicReportingHeader,
  ClinicReportingState,
  CompactMetricGrid,
  FunnelPanel,
  MetricCards,
  NarrativeBlock,
  TrustStrip,
} from './ClinicReportingBlocks'
import { FocusSummaryPanel } from './DashboardInsightSections'

export function WeeklyOperatorDashboard({ page }) {
  if (page.status === 'error' || !page.period) {
    return <ClinicReportingState page={page} />
  }

  const content = page.period.content ?? {}

  return (
    <PageShell className="py-section" width="full">
      <ClinicReportingHeader eyebrow="Weekly operator" page={page} title="Weekly Operator Dashboard">
        <Button asChild size="sm" variant="outline">
          <Link to={`/clinic/daily-ops?clientId=${page.client.id}`}>
            Daily operations
          </Link>
        </Button>
      </ClinicReportingHeader>
      <NarrativeBlock narrative={content.narrative} title="3 Wins, Losses, Next" />
      <FocusSummaryPanel narrative={content.narrative} title="Operator Focus" />
      <MetricCards items={content.hero_metrics} title="Weekly Headline" />
      <div className="grid gap-card xl:grid-cols-[1.15fr_0.85fr]">
        <FunnelPanel items={content.funnel} title="Funnel Leakage" />
        <CompactMetricGrid items={content.pipeline_health} title="Pipeline Health" />
      </div>
      <div className="grid gap-card xl:grid-cols-2">
        <ChannelTable items={content.channel_performance} title="Source Diagnostics" />
        <CompactMetricGrid items={content.experiments} title="Experiment Results" />
      </div>
      <div className="grid gap-card xl:grid-cols-2">
        <CompactMetricGrid items={content.reactivation_tracks} title="Reactivation Diagnostics" />
        <CompactMetricGrid items={content.deliverability} title="Deliverability And Workflow" />
      </div>
      <TrustStrip sources={page.period.source_trust} />
    </PageShell>
  )
}
