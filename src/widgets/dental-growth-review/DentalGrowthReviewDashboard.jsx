import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageShell } from '@/shared/ui'

import {
  DENTAL_GROWTH_REVIEW_VIEW_PRESETS,
  DENTAL_GROWTH_REVIEW_ZONE_IDS,
} from '../../entities/dental-growth-review'
import {
  DecisionCards,
  DentalGrowthReviewState,
  FreshnessFooter,
  FunnelView,
  GrowthReviewExecutiveSummary,
  GrowthReviewSection,
  GrowthReviewToolbar,
  HeatmapTable,
  HeroMetrics,
  MetricList,
  NarrativeColumns,
  ReactivationPerformance,
  SpeedChannelDiagnostics,
  TeamHealthDiagnostics,
  SimpleListCards,
} from './DentalGrowthReviewBlocks'

function getOpenZonesForMode(page, viewMode) {
  return Object.fromEntries((page.zones ?? []).map((zone) => [
    zone.id,
    viewMode === DENTAL_GROWTH_REVIEW_VIEW_PRESETS.OPERATOR
      ? !zone.defaultCollapsedForOperator
      : !zone.defaultCollapsedForExecutive,
  ]))
}

function getZonePreferenceKey(page, viewMode) {
  return page?.client?.id && viewMode
    ? `dental-growth-review.zone-state.${page.client.id}.${viewMode}`
    : null
}

function getViewModePreferenceKey(page) {
  return page?.client?.id ? `dental-growth-review.view-mode.${page.client.id}` : null
}

function readViewModePreference(page) {
  const preferenceKey = getViewModePreferenceKey(page)

  if (!preferenceKey || typeof window === 'undefined') {
    return null
  }

  const value = window.localStorage.getItem(preferenceKey)

  return Object.values(DENTAL_GROWTH_REVIEW_VIEW_PRESETS).includes(value) ? value : null
}

function readOpenZonePreference(page, viewMode) {
  const preferenceKey = getZonePreferenceKey(page, viewMode)

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

function getZoneDomId(zone) {
  return `growth-review-zone-${zone.number}`
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
        <SpeedChannelDiagnostics
          channels={content.channel_attribution}
          metrics={content.speed_to_lead}
        />
      )
    case DENTAL_GROWTH_REVIEW_ZONE_IDS.REACTIVATION_TRACKS:
      return (
        <div className="grid gap-card">
          <ReactivationPerformance tracks={content.reactivation_tracks} />
          <div className="grid gap-card xl:grid-cols-2">
            <HeatmapTable rows={content.heatmaps.reply_rate_by_track_touch} title="Reply Rate by Track by Touch" />
            <HeatmapTable rows={content.heatmaps.email_open_by_track} title="Email Open Rate by Track" />
          </div>
        </div>
      )
    case DENTAL_GROWTH_REVIEW_ZONE_IDS.DELIVERABILITY_TEAM_HEALTH:
      return (
        <TeamHealthDiagnostics
          deliverabilityMetrics={filterMetrics(content.metrics, [
            'sms-deliverability-rate',
            'sms-opt-out-rate',
            'email-deliverability-rate',
          ])}
          frontDeskHealth={content.front_desk_health}
          operationsChips={content.operations_chips}
        />
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
  const pageKey = page?.client?.id ?? 'unknown-client'
  const initialViewMode = useMemo(
    () => readViewModePreference(page) ?? page.preset ?? DENTAL_GROWTH_REVIEW_VIEW_PRESETS.EXECUTIVE,
    [page],
  )
  const [viewModeState, setViewModeState] = useState(() => ({
    pageKey,
    value: initialViewMode,
  }))
  const viewMode = viewModeState.pageKey === pageKey ? viewModeState.value : initialViewMode
  const openZonesKey = `${pageKey}:${viewMode}`
  const initialOpenZones = useMemo(
    () => readOpenZonePreference(page, viewMode) ?? getOpenZonesForMode(page, viewMode),
    [page, viewMode],
  )
  const [openZonesState, setOpenZonesState] = useState(() => ({
    key: openZonesKey,
    value: initialOpenZones,
  }))
  const openZones = openZonesState.key === openZonesKey ? openZonesState.value : initialOpenZones

  useEffect(() => {
    const preferenceKey = getViewModePreferenceKey(page)

    if (!preferenceKey || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(preferenceKey, viewMode)
  }, [page, viewMode])

  useEffect(() => {
    const preferenceKey = getZonePreferenceKey(page, viewMode)

    if (!preferenceKey || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(preferenceKey, JSON.stringify(openZones))
  }, [openZones, page, viewMode])

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

    navigate(`/client/growth-review?${search.toString()}`)
  }

  function toggleZone(zoneId) {
    setOpenZonesState((current) => {
      const currentValue = current.key === openZonesKey ? current.value : initialOpenZones

      return {
        key: openZonesKey,
        value: {
          ...currentValue,
          [zoneId]: !currentValue[zoneId],
        },
      }
    })
  }

  function handleViewModeChange(nextViewMode) {
    setViewModeState({
      pageKey,
      value: nextViewMode,
    })

    const nextOpenZonesKey = `${pageKey}:${nextViewMode}`
    setOpenZonesState({
      key: nextOpenZonesKey,
      value: readOpenZonePreference(page, nextViewMode) ?? getOpenZonesForMode(page, nextViewMode),
    })
  }

  const zoneNavItems = page.zones.map((zone) => ({
    href: `#${getZoneDomId(zone)}`,
    id: zone.id,
    label: `Zone ${zone.number}`,
  }))

  return (
    <PageShell className="pb-section" width="full">
      <GrowthReviewToolbar
        onPeriodChange={handlePeriodChange}
        onViewModeChange={handleViewModeChange}
        page={page}
        selectedPeriodOptionKey={page.selectedReviewPeriodOptionKey}
        viewMode={viewMode}
        zoneNavItems={zoneNavItems}
      />

      <GrowthReviewExecutiveSummary
        page={page}
        selectedPeriodOptionKey={page.selectedReviewPeriodOptionKey}
      />

      <div className="grid gap-section">
        {page.zones.map((zone) => (
          <GrowthReviewSection
            id={getZoneDomId(zone)}
            key={zone.id}
            onToggle={() => toggleZone(zone.id)}
            open={openZones[zone.id] ?? !zone.defaultCollapsed}
            zone={zone}
          >
            <ZoneContent content={content} zone={zone} />
          </GrowthReviewSection>
        ))}
      </div>

      <FreshnessFooter sources={period.data_sources} />
    </PageShell>
  )
}
