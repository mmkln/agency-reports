import {
  DentalGrowthReviewState,
  FunnelView,
  HeroMetrics,
} from './DentalGrowthReviewBlocks'
import { ReactivationActivityChart } from './ReactivationActivityChart'

const LEAD_TO_CONTACTED_METRIC_ID = 'lead_to_contacted_rate'

const dashboardMetricOrder = [
  'booked_appointments_created',
  'leads_received',
  LEAD_TO_CONTACTED_METRIC_ID,
  // 'opportunities_created',
  // Temporarily hidden from the hero grid. Keep the API metric available because it may return later.
  'lead_to_booked_rate',
  'known_source_rate',
  'attended_appointments',
]

function createLeadToContactedPlaceholder() {
  return {
    available: false,
    confidence: 'unavailable',
    delta_absolute: '',
    delta_percent: '',
    formula: 'lead contacted events / leads received',
    id: LEAD_TO_CONTACTED_METRIC_ID,
    prior_period_value: '',
    reason: 'Lead contact events are not calculated yet.',
    series: [],
    source: 'GHL Conversations',
    status: 'grey',
    target: null,
    title: 'Lead -> Contacted',
    unit: '%',
    value: 'Unavailable',
  }
}

function getDashboardMetrics(metrics = {}) {
  const leadToContactedMetric = metrics[LEAD_TO_CONTACTED_METRIC_ID]
    ?? metrics.lead_contacted_rate
    ?? createLeadToContactedPlaceholder()

  return dashboardMetricOrder
    .map((metricId) => (metricId === LEAD_TO_CONTACTED_METRIC_ID ? leadToContactedMetric : metrics[metricId]))
    .filter(Boolean)
}

export function DentalGrowthReviewDashboard({ funnelEmptyAction, onRetry, page }) {
  if (page.status === 'error' || !page.period) {
    return <DentalGrowthReviewState onRetry={onRetry} page={page} />
  }

  const metrics = getDashboardMetrics(page.charts?.metrics)
  const funnelChart = page.charts?.funnel ?? null
  const funnelStages = page.charts?.funnel?.stages ?? []
  const reactivationActivity = page.charts?.reactivationActivity ?? null

  return (
    <>
      <HeroMetrics metrics={metrics} />

      <ReactivationActivityChart chart={reactivationActivity} />

      <FunnelView
        emptyAction={funnelEmptyAction}
        funnel={funnelStages}
        funnelChart={funnelChart}
      />
    </>
  )
}
