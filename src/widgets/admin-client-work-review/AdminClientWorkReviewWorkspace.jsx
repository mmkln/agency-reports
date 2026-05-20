import {
  Badge,
  Button,
  ConfirmationDialog,
  EmptyState,
  Panel,
  PanelBody,
  StatusBadge,
} from '@/shared/ui'

const queueFilters = [
  { label: 'Ready', value: 'readyForReview' },
  { label: 'Needs summary', value: 'missingClientSummary' },
  { label: 'Waiting requests', value: 'waitingClientWithoutRequest' },
  { label: 'Blocked', value: 'blockedWithoutClientExplanation' },
  { label: 'Stale', value: 'stalePublished' },
  { label: 'Recent', value: 'recentlyPublished' },
  { label: 'All', value: 'all' },
  { label: 'Archived', value: 'archived' },
]

const recommendedActionLabels = {
  create_client_request: 'Create client request',
  keep_archived: 'Archived',
  monitor_recent_publish: 'Recently published',
  review_and_publish: 'Review and publish',
  review_stale_published_work: 'Check freshness',
  write_client_safe_explanation: 'Write client-safe explanation',
  write_client_summary: 'Write summary',
}

function formatDate(value) {
  if (!value) {
    return 'No date'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'No date'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getRecommendedActionLabel(value) {
  return recommendedActionLabels[value] ?? 'Review'
}

function LinkedRequestsBlock({ requests = [] }) {
  if (!requests.length) {
    return null
  }

  return (
    <div className="mt-3 grid gap-2 rounded-control bg-control px-3 py-2">
      <p className="text-label text-text-muted">Linked client request</p>
      {requests.map((request) => (
        <div className="flex flex-wrap items-center gap-2 text-ui text-text-secondary" key={request.id}>
          <span className="font-medium text-text-primary">{request.title}</span>
          {request.statusMeta ? <StatusBadge meta={request.statusMeta} /> : null}
          <span>Due {formatDate(request.dueDate)}</span>
        </div>
      ))}
    </div>
  )
}

function ReviewItemCard({
  item,
  onArchive,
  onCreateWorkItem,
  onCreateRequest,
  onEdit,
  onMarkReady,
  onPublish,
}) {
  const isWorkItem = Boolean(item.workItemId)
  const canMarkReady = isWorkItem && item.publishState === 'draft' && item.summaryStatus === 'ready'
  const canPublish = isWorkItem && item.publishState !== 'published' && item.summaryStatus === 'ready'
  const canArchive = isWorkItem && item.publishState !== 'archived'
  const hasLinkedRequests = Boolean(item.linkedRequests?.length)
  const canCreateRequest = item.recommendedAction === 'create_client_request' && !hasLinkedRequests

  return (
    <Panel data-testid={`client-work-review-${item.workItemId ?? item.taskId}`}>
      <PanelBody>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-ui text-text-primary">{item.title}</h2>
            {item.publishStateMeta ? <StatusBadge meta={item.publishStateMeta} /> : null}
            {item.clientFacingStatusMeta ? <StatusBadge meta={item.clientFacingStatusMeta} /> : null}
            {item.currentInternalStatusMeta ? <StatusBadge meta={item.currentInternalStatusMeta} /> : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-label font-normal text-text-muted">
            <span>{item.client?.name ?? 'Unknown client'}</span>
            <span aria-hidden="true">-</span>
            <span>{item.project?.name ?? 'General'}</span>
            <span aria-hidden="true">-</span>
            <span>Target {formatDate(item.targetDate)}</span>
            <span aria-hidden="true">-</span>
            <span>Updated {formatDate(item.updatedAt)}</span>
          </div>

          <p className="mt-3 max-w-readable text-body text-text-secondary">
            {item.summary || item.sourceTask?.clientSafeSummary || 'No client-safe summary yet.'}
          </p>

          <LinkedRequestsBlock requests={item.linkedRequests} />

          {item.sourceTask?.internalNote ? (
            <div className="mt-3 rounded-control bg-warning/10 px-3 py-2 text-ui text-text-secondary">
              <p className="font-medium text-text-primary">Internal note</p>
              <p className="mt-1">{item.sourceTask.internalNote}</p>
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
          <Badge className="bg-control text-text-secondary" variant="outline">
            {getRecommendedActionLabel(item.recommendedAction)}
          </Badge>
          {isWorkItem ? (
            <>
              <Button onClick={() => onEdit(item)} size="sm" type="button" variant="outline">
                Review
              </Button>
              {canMarkReady ? (
                <Button onClick={() => onMarkReady(item)} size="sm" type="button" variant="ghost">
                  Mark ready
                </Button>
              ) : null}
              {canPublish ? (
                <Button onClick={() => onPublish(item)} size="sm" type="button">
                  Publish
                </Button>
              ) : null}
              {canArchive ? (
                <Button onClick={() => onArchive(item)} size="sm" type="button" variant="ghost">
                  Archive
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <Button onClick={() => onCreateWorkItem(item)} size="sm" type="button" variant="outline">
                Create work item
              </Button>
              {canCreateRequest ? (
                <Button onClick={() => onCreateRequest(item)} size="sm" type="button">
                  Create request
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>
      </PanelBody>
    </Panel>
  )
}

export function AdminClientWorkReviewWorkspace({
  onArchive,
  onArchiveConfirm,
  onCreateWorkItem,
  onCreateRequest,
  onEdit,
  onMarkReady,
  onPublish,
  onQueueFilterChange,
  pendingArchive,
  queueCounts,
  queueFilter,
  visibleItems,
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-control p-micro">
            {queueFilters.map((filter) => (
              <Button
                aria-pressed={queueFilter === filter.value}
                className={queueFilter === filter.value ? 'bg-control-selected text-text-primary' : 'text-text-secondary'}
                key={filter.value}
                onClick={() => onQueueFilterChange(filter.value)}
                size="sm"
                type="button"
                variant="ghost"
              >
                {filter.label}
                <span className="ml-1 text-text-muted">{queueCounts[filter.value] ?? 0}</span>
              </Button>
            ))}
          </div>
          <Badge className="w-fit bg-control text-text-secondary" variant="outline">
            {queueCounts.readyForReview} ready to review
          </Badge>
        </div>

        {visibleItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {visibleItems.map((item) => (
              <ReviewItemCard
                item={item}
                key={item.workItemId ?? item.taskId}
                onArchive={onArchive}
                onCreateWorkItem={onCreateWorkItem}
                onCreateRequest={onCreateRequest}
                onEdit={onEdit}
                onMarkReady={onMarkReady}
                onPublish={onPublish}
              />
            ))}
          </div>
        ) : (
          <Panel>
            <PanelBody>
              <EmptyState
                description="Client-facing work that needs review will appear here."
                iconName="checkCircle2"
                title="No review items"
              />
            </PanelBody>
          </Panel>
        )}
      </div>

      <ConfirmationDialog
        confirmLabel="Archive"
        description={pendingArchive ? `${pendingArchive.title} will be removed from the client-facing surface.` : ''}
        onConfirm={onArchiveConfirm}
        onOpenChange={(open) => !open && onArchive(null)}
        open={Boolean(pendingArchive)}
        title="Archive client-facing work?"
        tone="destructive"
      />
    </>
  )
}
