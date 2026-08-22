import { GrowthReviewRefreshControl } from '@/features/growth-review-data'
import { ContentToolbar } from '@/shared/ui'

import { reactivationText } from './reactivationTypography'

const SEQUENCE_STARTED_STAGE_KEY = 'sequence_started'

function formatPeriodDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

function formatPeriodRange(period) {
  const start = formatPeriodDate(period?.start ?? period?.period_start)
  const end = formatPeriodDate(period?.end ?? period?.period_end)

  if (!start || !end) {
    return ''
  }

  return `${start} – ${end}`
}

function formatUpdatedAt(value) {
  if (!value) {
    return 'Data update pending'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Data update pending'
  }

  return `Data updated ${date.toLocaleString('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  })}`
}

function getCampaignContext(funnelChart) {
  const stages = funnelChart?.stages ?? []
  const cohortCount = Number(stages[0]?.stage_count ?? 0)
  const sequenceStartedCount = Number(
    stages.find((stage) => stage.stage_id === SEQUENCE_STARTED_STAGE_KEY)?.stage_count ?? 0,
  )

  return {
    cohortLabel: cohortCount > 0
      ? `${cohortCount.toLocaleString('en-US')} patients in cohort`
      : '',
    sequenceStartedLabel: sequenceStartedCount > 0
      ? `${sequenceStartedCount.toLocaleString('en-US')} started sequence`
      : '',
  }
}

export function GrowthReviewCampaignContextToolbar({
  campaign,
  campaignSelector,
  funnelChart,
  period,
  refresh,
  secondaryAction,
  updatedAt,
}) {
  const periodRange = formatPeriodRange(period)
  const { cohortLabel, sequenceStartedLabel } = getCampaignContext(funnelChart)

  return (
    <ContentToolbar className="rounded-none bg-transparent p-0 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        {campaignSelector ?? (
          <h2 className={reactivationText.sectionTitle}>
            {campaign?.name || 'Reactivation campaign'}
          </h2>
        )}
        {periodRange || cohortLabel ? (
          <div className={`mt-tag grid gap-1 ${reactivationText.updatedMeta}`}>
            {periodRange ? <p>{periodRange}</p> : null}
            {cohortLabel ? (
              <p>
                <span>{cohortLabel}</span>
                {sequenceStartedLabel ? (
                  <>
                    <span> · </span>
                    <span>{sequenceStartedLabel}</span>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-control">
        <p className={reactivationText.updatedMeta}>{formatUpdatedAt(updatedAt)}</p>
        <GrowthReviewRefreshControl refresh={refresh} />
        {secondaryAction}
      </div>
    </ContentToolbar>
  )
}
