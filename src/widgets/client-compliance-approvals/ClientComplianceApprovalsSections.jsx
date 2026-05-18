import {
  Badge,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  PropertyGrid,
  StatusBadge,
} from '@/shared/ui'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value || 0))
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : 'Not set'
}

function formatIssueLabel(value) {
  return String(value || 'Issue')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
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

function ComplianceReviewCard({ review }) {
  return (
    <article className="rounded-block bg-block p-block shadow-block">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-tag">
            <h3 className="text-ui font-medium text-text-primary">{review.title}</h3>
            <StatusBadge meta={review.statusMeta} />
          </div>
          <p className="mt-2 text-body text-text-secondary">{review.summary || 'No compliance summary provided.'}</p>
        </div>
        <Badge className="w-fit border-control-border bg-fill text-text-secondary" variant="outline">
          {review.platform || 'Policy review'}
        </Badge>
      </div>

      <PropertyGrid
        className="mt-5"
        columns={4}
        items={[
          {
            label: 'Open issues',
            value: formatNumber(review.openIssues),
          },
          {
            label: 'Pending approvals',
            value: formatNumber(review.pendingApprovals),
          },
          {
            label: 'Limited ads',
            value: formatNumber(review.limitedAds),
          },
          {
            label: 'Blocked items',
            value: formatNumber(review.blockedItems),
          },
        ]}
      />

      {review.riskNote ? (
        <p className="mt-5 text-body text-text-secondary">{review.riskNote}</p>
      ) : null}
      {review.nextAction ? (
        <p className="mt-3 text-body text-text-primary">{review.nextAction}</p>
      ) : null}

      {review.policyIssues?.length ? (
        <div className="mt-5 grid gap-item">
          {review.policyIssues.map((issue, index) => (
            <div className="rounded-control bg-block-subtle p-component" key={issue.id || `${review.id}-policy-${index}`}>
              <div className="flex flex-wrap items-center gap-tag">
                <Badge className="border-control-border bg-fill text-text-secondary" variant="outline">
                  {formatIssueLabel(issue.type)}
                </Badge>
                <span className="text-label text-text-muted">
                  {issue.platform || 'Policy'}{issue.affected_campaign ? ` - ${issue.affected_campaign}` : ''}
                </span>
              </div>
              {issue.reason ? (
                <p className="mt-2 text-body text-text-secondary">{issue.reason}</p>
              ) : null}
              {issue.next_action ? (
                <p className="mt-2 text-body text-text-primary">{issue.next_action}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function ApprovalCard({ approval }) {
  return (
    <article className="rounded-block bg-block p-block shadow-block">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-tag">
            <h3 className="text-ui font-medium text-text-primary">{approval.title}</h3>
            <StatusBadge meta={approval.statusMeta} />
          </div>
          <p className="mt-2 text-body text-text-secondary">{approval.instructions || 'No review instructions provided.'}</p>
        </div>
        <Badge className="w-fit border-control-border bg-fill text-text-secondary" variant="outline">
          {approval.approvalTypeMeta?.label ?? 'Approval'}
        </Badge>
      </div>

      <PropertyGrid
        className="mt-5"
        columns={4}
        items={[
          {
            label: 'Version',
            value: approval.version || 'Not set',
          },
          {
            label: 'Approver',
            value: approval.approverLabel || 'Not assigned',
          },
          {
            label: 'Due',
            value: formatDate(approval.dueDate),
          },
          {
            label: 'Service line',
            value: approval.serviceLine?.name ?? 'Not linked',
          },
        ]}
      />

      {approval.decisionComment ? (
        <p className="mt-5 text-body text-text-secondary">{approval.decisionComment}</p>
      ) : null}
      {approval.history.length ? (
        <div className="mt-5 grid gap-item">
          {approval.history.map((item) => (
            <div className="rounded-control bg-block-subtle p-component" key={`${approval.id}-${item.version}-${item.decided_at}`}>
              <p className="text-label text-text-muted">
                {item.actor_label || 'Approver'} - {formatDate(item.decided_at)} - {item.version || 'version not set'}
              </p>
              <p className="mt-1 text-body text-text-secondary">{item.comment || item.decision}</p>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function DataFreshness({ page }) {
  return (
    <Panel>
      <PanelHeader title="Data Freshness" />
      <PanelBody>
        <PropertyGrid
          columns={3}
          items={[
            {
              label: 'Last updated',
              value: formatDate(page.latestUpdatedAt),
            },
            {
              label: 'Data mode',
              value: 'Manual compliance records',
            },
            {
              label: 'Privacy boundary',
              value: 'No patient-level approval records',
            },
          ]}
        />
      </PanelBody>
    </Panel>
  )
}

export function ClientComplianceApprovalsView({ page }) {
  if (page.isEmpty) {
    return (
      <EmptyState
        description="Compliance reviews and medical approvals will appear after the agency publishes clinic-safe review records."
        iconName="shieldCheck"
        title="No compliance records yet"
      />
    )
  }

  return (
    <div className="grid gap-card">
      <section className="grid gap-card md:grid-cols-2 xl:grid-cols-4" aria-label="Compliance and approvals summary">
        <SummaryMetric
          helper="Reviews needing attention"
          label="Open issues"
          value={formatNumber(page.totals.openIssues)}
        />
        <SummaryMetric
          helper="Medical or clinic review required"
          label="Pending approvals"
          value={formatNumber(page.totals.pendingApprovals)}
        />
        <SummaryMetric
          helper="Campaign assets limited by policy"
          label="Limited ads"
          value={formatNumber(page.totals.limitedAds)}
        />
        <SummaryMetric
          helper="Logged unresolved platform or privacy issues"
          label="Open policy issues"
          value={formatNumber(page.totals.openPolicyIssues)}
        />
      </section>

      <Panel>
        <PanelHeader title="Compliance Reviews" />
        <PanelBody className="grid gap-card">
          {page.reviews.map((review) => (
            <ComplianceReviewCard key={review.id} review={review} />
          ))}
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader title="Medical Approvals" />
        <PanelBody className="grid gap-card">
          {page.approvals.map((approval) => (
            <ApprovalCard approval={approval} key={approval.id} />
          ))}
        </PanelBody>
      </Panel>

      <DataFreshness page={page} />
    </div>
  )
}
