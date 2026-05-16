import { Link } from 'react-router-dom'

import {
  Button,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { Icon } from '../../shared/icons'
import { CampaignExecutionSection } from './CampaignExecutionSection'
import { formatDate } from './formatters'
import {
  DashboardContextBar,
  ExecutiveSummaryHero,
  MetricCard,
  StaleDataWarning,
  TrustSignalStrip,
} from './OverviewSections'
import {
  ChannelBreakdownSection,
  FunnelSection,
  GoalsSection,
} from './PerformanceBreakdownSections'
import {
  BulletPanel,
  ClientActionCard,
  InsightCard,
  NextStepCard,
  WhatWeDidSection,
} from './SupportingSections'
import {
  AppendixTablesSection,
  ServiceSectionsSection,
  TrendSeriesSection,
} from './TrendAndDetailSections'

export function ClientPerformanceDashboard({ mode, page }) {
  const dashboard = page.performanceDashboard
  const content = dashboard.content ?? {}
  const executiveSummary = content.executive_summary ?? {}
  const heroMetric = content.hero_metric ?? null
  const kpiCards = content.kpi_cards ?? []
  const insights = content.insights ?? []
  const nextSteps = content.next_steps ?? []

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6">
      <DashboardContextBar
        client={page.client}
        dashboard={dashboard}
        mode={mode}
        periods={page.periods}
      />

      <div className="flex flex-wrap gap-tag">
        <StatusBadge meta={dashboard.dataConfidenceMeta} />
        <StatusBadge meta={dashboard.dataModeMeta} />
      </div>

      <ExecutiveSummaryHero
        dashboard={dashboard}
        executiveSummary={executiveSummary}
        heroMetric={heroMetric}
      />

      <TrustSignalStrip dashboard={dashboard} />

      <StaleDataWarning freshness={dashboard.freshness} />

      {kpiCards.length ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((metric, index) => (
            <MetricCard key={metric.id || `${metric.label}-${index}`} metric={metric} />
          ))}
        </section>
      ) : null}

      <CampaignExecutionSection campaign={content.campaign_execution} />

      <GoalsSection goals={content.goals} />

      <TrendSeriesSection trends={content.trends} />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <FunnelSection funnel={content.funnel} />
        <ChannelBreakdownSection channels={content.channel_breakdown} />
      </div>

      <ServiceSectionsSection sections={content.service_sections} />

      <WhatWeDidSection agencyWork={content.agency_work} workSummary={page.workSummary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BulletPanel
          emptyText="No insights have been added yet."
          items={insights}
          renderItem={(insight, index) => <InsightCard index={index} insight={insight} key={insight.id || `${insight.title}-${index}`} />}
          title="What Changed"
        />

        <BulletPanel
          emptyText="No next actions have been added yet."
          items={nextSteps}
          renderItem={(step, index) => <NextStepCard index={index} key={step.id || `${step.title}-${index}`} step={step} />}
          title="Next Actions"
        />
      </div>

      <AppendixTablesSection tables={content.appendix_tables} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BulletPanel
          emptyText="No client actions are open right now."
          items={page.neededFromClient}
          renderItem={(action) => (
            <ClientActionCard
              action={action}
              key={action.id}
              requestsHref={`/client/requests?clientId=${page.client.id}`}
            />
          )}
          title="Needed From Client"
        />

        <Panel>
          <PanelHeader title="Source Links & Latest Report" />
          <PanelBody className="grid gap-component">
            {page.sourceLinks?.length ? (
              <div className="grid gap-2">
                {page.sourceLinks.map((sourceLink) => (
                  <Button asChild className="w-full min-w-0 justify-start" key={sourceLink.id} variant="outline">
                    <a href={sourceLink.publicUrl || sourceLink.embedUrl} rel="noreferrer" target="_blank">
                      <Icon name="layoutDashboard" size={15} />
                      <span className="min-w-0 truncate">{sourceLink.name}</span>
                    </a>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-ui text-text-muted">No external source links are published yet.</p>
            )}

            {page.latestReport ? (
              <div className="rounded-control border border-control-border bg-block-subtle p-4">
                <p className="text-ui text-text-primary">{page.latestReport.title}</p>
                <p className="mt-1 text-label font-normal text-text-muted">
                  {formatDate(page.latestReport.periodStart)} - {formatDate(page.latestReport.periodEnd)}
                </p>
                <p className="mt-2 text-body text-text-secondary">{page.latestReport.summary}</p>
                <Button asChild className="mt-3" size="sm" variant="outline">
                  <Link to={`/client/reports?clientId=${page.client.id}&reportId=${page.latestReport.id}`}>
                    Read report
                    <Icon name="arrowRight" size={14} />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-ui text-text-muted">No published report yet.</p>
            )}
          </PanelBody>
        </Panel>
      </div>
    </div>
  )
}
