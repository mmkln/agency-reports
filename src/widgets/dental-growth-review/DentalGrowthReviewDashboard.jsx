import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageShell } from '@/shared/ui'

import {
  DENTAL_GROWTH_REVIEW_ZONE_IDS,
} from '../../entities/dental-growth-review'
import {
  ChannelTable,
  DecisionCards,
  DentalGrowthReviewState,
  FreshnessFooter,
  FunnelView,
  HeatmapTable,
  HeroMetrics,
  MetricList,
  NarrativeColumns,
  ReactivationTrackTable,
  ReviewHeader,
  SimpleListCards,
  ZonePanel,
} from './DentalGrowthReviewBlocks'

function getInitialOpenZones(page) {
  return Object.fromEntries((page.zones ?? []).map((zone) => [zone.id, !zone.defaultCollapsed]))
}

function getPreferenceKey(page) {
  return page?.client?.id && page?.preset
    ? `dental-growth-review.zone-state.${page.client.id}.${page.preset}`
    : null
}

function readOpenZonePreference(page) {
  const preferenceKey = getPreferenceKey(page)

  if (!preferenceKey || typeof window === 'undefined') {
    return null
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(preferenceKey))
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function filterMetrics(metrics, ids) {
  const idSet = new Set(ids)
  return metrics.filter((metric) => idSet.has(metric.id))
}

function ZoneContent({ content, zone }) {
  switch (zone.id) {
    case DENTAL_GROWTH_REVIEW_ZONE_IDS.PERIOD_CONTEXT:
      return (
        <div className="grid gap-control md:grid-cols-3">
          <div className="rounded-control bg-block-subtle p-control">
            <p className="text-label text-text-muted">Summary</p>
            <p className="mt-tag text-ui text-text-primary">{content.period_context.auto_summary}</p>
          </div>
          <div className="rounded-control bg-block-subtle p-control">
            <p className="text-label text-text-muted">Alert</p>
            <p className="mt-tag text-ui text-text-primary">{content.period_context.top_alert_message}</p>
          </div>
          <div className="rounded-control bg-block-subtle p-control">
            <p className="text-label text-text-muted">Data freshness</p>
            <p className="mt-tag text-ui text-text-primary">{content.period_context.freshness_summary}</p>
          </div>
        </div>
      )
    case DENTAL_GROWTH_REVIEW_ZONE_IDS.HERO_METRICS:
      return <HeroMetrics metrics={content.hero_metrics} />
    case DENTAL_GROWTH_REVIEW_ZONE_IDS.WINS_LOSSES_NEXT:
      return <NarrativeColumns items={content.narrative_items} />
    case DENTAL_GROWTH_REVIEW_ZONE_IDS.FUNNEL_CONVERSION:
      return <FunnelView funnel={content.funnel} highlights={content.funnel_highlights} />
    case DENTAL_GROWTH_REVIEW_ZONE_IDS.SPEED_TO_LEAD_CHANNEL:
      return (
        <div className="grid gap-card">
          <MetricList metrics={content.speed_to_lead} />
          <ChannelTable channels={content.channel_attribution} />
        </div>
      )
    case DENTAL_GROWTH_REVIEW_ZONE_IDS.REACTIVATION_TRACKS:
      return (
        <div className="grid gap-card">
          <ReactivationTrackTable tracks={content.reactivation_tracks} />
          <div className="grid gap-card xl:grid-cols-2">
            <HeatmapTable rows={content.heatmaps.reply_rate_by_track_touch} title="Reply Rate by Track by Touch" />
            <HeatmapTable rows={content.heatmaps.email_open_by_track} title="Email Open Rate by Track" />
          </div>
        </div>
      )
    case DENTAL_GROWTH_REVIEW_ZONE_IDS.DELIVERABILITY_TEAM_HEALTH:
      return (
        <div className="grid gap-card">
          <MetricList metrics={filterMetrics(content.metrics, [
            'sms-deliverability-rate',
            'sms-opt-out-rate',
            'email-deliverability-rate',
          ])}
          />
          <MetricList metrics={content.front_desk_health} />
          <MetricList metrics={content.operations_chips} />
        </div>
      )
    case DENTAL_GROWTH_REVIEW_ZONE_IDS.REPUTATION_REFERRAL:
      return <MetricList metrics={content.reputation_referral} />
    case DENTAL_GROWTH_REVIEW_ZONE_IDS.DECISIONS_EXPERIMENTS:
      return (
        <div className="grid gap-card">
          <DecisionCards decisions={content.decisions} />
          <div className="grid gap-card xl:grid-cols-3">
            <SimpleListCards items={content.watching} title="Watching" />
            <SimpleListCards items={content.closed_loops} title="Recently Shipped / Closed Loops" />
            <SimpleListCards items={content.experiments} title="Experiments" />
          </div>
        </div>
      )
    default:
      return null
  }
}

export function DentalGrowthReviewDashboard({ page }) {
  const navigate = useNavigate()
  const initialOpenZones = useMemo(() => readOpenZonePreference(page) ?? getInitialOpenZones(page), [page])
  const [openZones, setOpenZones] = useState(initialOpenZones)

  useEffect(() => {
    const preferenceKey = getPreferenceKey(page)

    if (!preferenceKey || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(preferenceKey, JSON.stringify(openZones))
  }, [openZones, page])

  if (page.status === 'error' || !page.period) {
    return (
      <PageShell className="py-section" width="full">
        <DentalGrowthReviewState page={page} />
      </PageShell>
    )
  }

  const period = page.period
  const content = period.content

  function handlePeriodChange(optionKey) {
    const selected = page.reviewPeriodOptions.find((option) => option.key === optionKey)

    if (!selected?.periodId) {
      return
    }

    const search = new URLSearchParams()
    search.set('clientId', page.client.id)
    search.set('periodId', selected.periodId)

    if (selected?.periodType) {
      search.set('periodType', selected.periodType)
    }

    navigate(`/dashboards/dental-growth-review?${search.toString()}`)
  }

  function toggleZone(zoneId) {
    setOpenZones((current) => ({
      ...current,
      [zoneId]: !current[zoneId],
    }))
  }

  return (
    <PageShell className="py-section" width="full">
      <ReviewHeader
        onPeriodChange={handlePeriodChange}
        page={page}
        selectedPeriodOptionKey={page.selectedReviewPeriodOptionKey}
      />

      <div className="grid gap-card">
        {page.zones.map((zone) => (
          <ZonePanel
            key={zone.id}
            onToggle={() => toggleZone(zone.id)}
            open={openZones[zone.id] ?? !zone.defaultCollapsed}
            zone={zone}
          >
            <ZoneContent content={content} zone={zone} />
          </ZonePanel>
        ))}
      </div>

      <FreshnessFooter sources={period.data_sources} />
    </PageShell>
  )
}
