import {
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { formatDate, formatPeriod } from './formatters'

function TrustContextItem({ label, meta, value }) {
  if (!value && !meta) {
    return null
  }

  return (
    <div>
      <p className="text-label text-text-muted">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {meta ? <StatusBadge meta={meta} /> : null}
        {value ? <p className="text-ui text-text-primary">{value}</p> : null}
      </div>
    </div>
  )
}

export function ResultsTrustContext({ trustContext }) {
  if (!trustContext) {
    return null
  }

  return (
    <Panel id="results-trust-context">
      <PanelHeader
        subtitle={trustContext.copy?.subtitle ?? 'Data freshness, source status, and interpretation caveats before the raw dashboard.'}
        title={trustContext.copy?.title ?? 'Data Trust Context'}
      />
      <PanelBody className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TrustContextItem
            label="Last updated"
            value={formatDate(trustContext.lastUpdatedAt)}
          />
          <TrustContextItem
            label="Freshness"
            value={trustContext.dataFreshness?.label ?? 'Update date unavailable'}
          />
          <TrustContextItem
            label="Confidence"
            meta={trustContext.dataConfidenceMeta}
          />
          <TrustContextItem
            label="Data source"
            meta={trustContext.dataModeMeta}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <TrustContextItem
            label="Performance period"
            meta={trustContext.performancePeriod?.statusMeta}
            value={trustContext.performancePeriod ? formatPeriod(trustContext.performancePeriod) : 'Not published yet'}
          />
          <TrustContextItem
            label="Source dashboard"
            meta={trustContext.sourceDashboard?.statusMeta}
            value={trustContext.sourceDashboard?.name ?? 'Not published yet'}
          />
          <TrustContextItem
            label="Latest report"
            meta={trustContext.latestReport?.statusMeta}
            value={trustContext.latestReport ? formatPeriod(trustContext.latestReport) : 'No published report yet'}
          />
        </div>

        {trustContext.caveats.length ? (
          <div className="grid gap-3">
            {trustContext.caveats.map((caveat) => (
              <div className="rounded-control bg-block-subtle p-4" key={caveat.id}>
                <p className="text-label text-text-muted">{caveat.label}</p>
                <p className="mt-2 text-body text-text-secondary">{caveat.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </PanelBody>
    </Panel>
  )
}
