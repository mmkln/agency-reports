import { Link } from 'react-router-dom'

import {
  Badge,
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  Progress,
  PropertyGrid,
} from '@/shared/ui'

import { ClientClinicDataTrust } from '../client-clinic-data-trust'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value || 0))
}

function formatRating(value) {
  return `${Number(value || 0).toFixed(1)} / 5`
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`
}

function SummaryMetric({ helper, label, value }) {
  return (
    <article className="rounded-block bg-block p-block shadow-block">
      <p className="text-label text-text-muted">{label}</p>
      <p className="mt-micro text-data tabular-nums text-text-primary">{value}</p>
      <p className="mt-item text-label font-normal text-text-secondary">{helper}</p>
    </article>
  )
}

function SnapshotCard({ clientId, snapshot }) {
  return (
    <article className="rounded-block bg-block p-block shadow-block">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-ui font-medium text-text-primary">
            {snapshot.location?.name ?? 'All clinic locations'}
          </h3>
          <p className="mt-2 text-body text-text-secondary">
            {snapshot.summary || 'No reputation summary provided.'}
          </p>
        </div>
        <Badge className="w-fit border-control-border bg-fill text-text-secondary" variant="outline">
          {snapshot.periodLabel}
        </Badge>
      </div>

      <PropertyGrid
        className="mt-5"
        columns={4}
        items={[
          {
            label: 'Google rating',
            value: formatRating(snapshot.googleRating),
          },
          {
            label: 'Review count',
            value: formatNumber(snapshot.reviewCount),
          },
          {
            label: 'Reviews gained',
            value: formatNumber(snapshot.reviewsGained),
          },
          {
            label: 'Unanswered',
            value: formatNumber(snapshot.unansweredReviews),
          },
        ]}
      />

      {snapshot.insight ? (
        <p className="mt-5 text-body text-text-secondary">{snapshot.insight}</p>
      ) : null}

      {snapshot.relatedActions?.length ? (
        <div className="mt-5 grid gap-tag">
          {snapshot.relatedActions.map((action) => (
            <div className="flex flex-col gap-3 rounded-control bg-surface-subtle p-3 sm:flex-row sm:items-center sm:justify-between" key={action.id}>
              <div className="min-w-0">
                <p className="text-ui text-text-primary">{action.title}</p>
                <p className="text-label font-normal text-text-muted">
                  {action.dueDate ? `Due ${new Date(action.dueDate).toLocaleDateString()}` : 'No due date'}
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to={`/client/action-needed?clientId=${clientId}`}>
                  Open action
                </Link>
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function ReviewResponseWork({ page }) {
  return (
    <Panel>
      <PanelHeader title="Review Response Work" />
      <PanelBody>
        <PropertyGrid
          columns={4}
          items={[
            {
              label: 'Negative reviews',
              value: formatNumber(page.totals.negativeReviews),
            },
            {
              label: 'Unanswered reviews',
              value: formatNumber(page.totals.unansweredReviews),
            },
            {
              label: 'Response drafts',
              value: formatNumber(page.totals.reviewResponseDrafts),
            },
            {
              label: 'Review request campaign',
              value: page.latestSnapshot?.reviewRequestStatus ?? 'Not started',
            },
          ]}
        />
      </PanelBody>
    </Panel>
  )
}

function LocalPresence({ page }) {
  const latestSnapshot = page.latestSnapshot

  return (
    <Panel>
      <PanelHeader title="Local Presence" />
      <PanelBody className="grid gap-component">
        <PropertyGrid
          columns={3}
          items={[
            {
              label: 'GBP updates',
              value: formatNumber(page.totals.gbpUpdates),
            },
            {
              label: 'Provider profiles',
              value: formatPercent(page.totals.providerProfileCompleteness),
            },
            {
              label: 'Data source',
              value: latestSnapshot?.dataSource ?? 'Manual aggregate import',
            },
          ]}
        />

        <div className="grid gap-item">
          <div className="flex items-center justify-between gap-component">
            <span className="text-ui text-text-primary">Provider profile completeness</span>
            <span className="text-label tabular-nums text-text-secondary">
              {formatPercent(page.totals.providerProfileCompleteness)}
            </span>
          </div>
          <Progress
            aria-label="Provider profile completeness"
            value={page.totals.providerProfileCompleteness * 100}
          />
        </div>

        {latestSnapshot?.localVisibilityNote ? (
          <p className="text-body text-text-secondary">{latestSnapshot.localVisibilityNote}</p>
        ) : null}
      </PanelBody>
    </Panel>
  )
}

export function ClientReputationView({ page }) {
  if (page.isEmpty) {
    return (
      <EmptyState
        description="Aggregate review, local presence, and Google Business Profile metrics will appear after the agency imports clinic-safe reputation data."
        iconName="messageSquare"
        title="No reputation data yet"
      />
    )
  }

  return (
    <div className="grid gap-card">
      <section className="grid gap-card md:grid-cols-2 xl:grid-cols-4" aria-label="Reputation summary">
        <SummaryMetric
          helper="Latest Google Business rating"
          label="Google rating"
          value={formatRating(page.totals.googleRating)}
        />
        <SummaryMetric
          helper="Total public review base"
          label="Review count"
          value={formatNumber(page.totals.reviewCount)}
        />
        <SummaryMetric
          helper="New reviews in this view"
          label="Reviews gained"
          value={formatNumber(page.totals.reviewsGained)}
        />
        <SummaryMetric
          helper="Clinic responses still needed"
          label="Unanswered reviews"
          value={formatNumber(page.totals.unansweredReviews)}
        />
      </section>

      <ReviewResponseWork page={page} />
      <LocalPresence page={page} />

      <Panel>
        <PanelHeader title="Reputation Snapshots" />
        <PanelBody className="grid gap-card">
          {page.snapshots.map((snapshot) => (
            <SnapshotCard clientId={page.client.id} key={snapshot.id} snapshot={snapshot} />
          ))}
        </PanelBody>
      </Panel>

      <ClientClinicDataTrust dataTrust={page.dataTrust} />
    </div>
  )
}
