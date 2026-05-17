import { Button } from '@/shared/ui'

import {
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_COMPLIANCE_STATUS_META,
  CLINIC_RECORD_PUBLISH_STATE_META,
  CLINIC_RECORD_PUBLISH_STATES,
} from '../../../entities/clinic'
import { WorkspaceCard } from '../../admin-client-workspace'
import { ComplianceReviewStatusActions } from './ComplianceReviewStatusActions'
import { PolicyIssuesEditor } from './PolicyIssuesEditor'
import {
  NotesField,
  NumberField,
  SelectField,
  SelectItem,
  TextField,
} from './ComplianceFields'

function createBlankReview() {
  return {
    blocked_items: '',
    data_source: '',
    limited_ads: '',
    location_id: '',
    next_action: '',
    open_issues: '',
    pending_approvals: '',
    policy_issues: [],
    platform: '',
    risk_note: '',
    service_line_id: '',
    status: CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
    summary: '',
    title: '',
  }
}

function getPublishLabel(record) {
  return CLINIC_RECORD_PUBLISH_STATE_META[
    record.publish_state || CLINIC_RECORD_PUBLISH_STATES.DRAFT
  ].label
}

function canPublishRecord(record, isDirty) {
  return Boolean(record.id)
    && !isDirty
    && record.publish_state !== CLINIC_RECORD_PUBLISH_STATES.PUBLISHED
}

export function ComplianceReviewsCard({
  draft,
  isDirty,
  locations,
  onApplyStatus = () => {},
  onPublish,
  onUpdate,
  serviceLines,
}) {
  function updateReview(index, fieldName, value) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      complianceReviews: currentDraft.complianceReviews.map((review, reviewIndex) => (
        reviewIndex === index ? { ...review, [fieldName]: value } : review
      )),
    }))
  }

  function addReview() {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      complianceReviews: [
        createBlankReview(),
        ...currentDraft.complianceReviews,
      ],
    }))
  }

  function removeReview(index) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      complianceReviews: currentDraft.complianceReviews.filter((_, reviewIndex) => reviewIndex !== index),
    }))
  }

  return (
    <WorkspaceCard
      action={(
        <Button onClick={addReview} size="sm" type="button" variant="outline">
          Add review
        </Button>
      )}
      description="Policy, claims, privacy, and ad-platform review records visible in client-safe compliance summaries."
      iconName="shieldCheck"
      title="Compliance Reviews"
    >
      <div className="grid gap-component">
        {draft.complianceReviews.length === 0 ? (
          <p className="rounded-control bg-surface-subtle px-3 py-4 text-ui text-text-muted">
            No compliance reviews yet.
          </p>
        ) : null}

        {draft.complianceReviews.map((review, index) => (
          <section className="grid gap-component rounded-control bg-surface-subtle p-3" key={review.id || `new-review-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-label font-semibold text-text-primary">
                  Review {index + 1}
                </p>
                <p className="text-label text-text-muted">
                  {getPublishLabel(review)}
                  {review.published_at ? ` at ${review.published_at}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!canPublishRecord(review, isDirty)}
                  onClick={() => onPublish({ id: review.id, type: 'review' })}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Publish
                </Button>
                <Button onClick={() => removeReview(index)} size="sm" type="button" variant="ghost">
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-component md:grid-cols-3">
              <TextField
                label="Title"
                onChange={(value) => updateReview(index, 'title', value)}
                placeholder="Implants campaign policy review"
                required
                value={review.title}
              />
              <TextField
                label="Platform / area"
                onChange={(value) => updateReview(index, 'platform', value)}
                placeholder="Google Ads, Meta, HIPAA tracking"
                value={review.platform}
              />
              {review.id ? (
                <div className="grid gap-2">
                  <span className="text-label text-text-muted">Status</span>
                  <p className="rounded-control bg-block px-3 py-2 text-ui text-text-primary">
                    {CLINIC_COMPLIANCE_STATUS_META[
                      review.status || CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED
                    ].label}
                  </p>
                </div>
              ) : (
                <SelectField
                  label="Initial status"
                  onChange={(value) => updateReview(index, 'status', value)}
                  value={review.status || CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED}
                >
                  {Object.values(CLINIC_COMPLIANCE_STATUSES).map((status) => (
                    <SelectItem key={status} value={status}>
                      {CLINIC_COMPLIANCE_STATUS_META[status].label}
                    </SelectItem>
                  ))}
                </SelectField>
              )}
              <SelectField
                label="Service line"
                onChange={(value) => updateReview(index, 'service_line_id', value)}
                value={review.service_line_id}
              >
                {serviceLines.map((serviceLine) => (
                  <SelectItem key={serviceLine.id} value={serviceLine.id}>
                    {serviceLine.name}
                  </SelectItem>
                ))}
              </SelectField>
              <SelectField
                label="Location"
                onChange={(value) => updateReview(index, 'location_id', value)}
                value={review.location_id}
              >
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectField>
              <TextField
                label="Data source"
                onChange={(value) => updateReview(index, 'data_source', value)}
                placeholder="Manual policy review"
                value={review.data_source}
              />
            </div>

            <div className="grid gap-component md:grid-cols-4">
              <NumberField label="Open issues" onChange={(value) => updateReview(index, 'open_issues', value)} value={review.open_issues} />
              <NumberField label="Pending approvals" onChange={(value) => updateReview(index, 'pending_approvals', value)} value={review.pending_approvals} />
              <NumberField label="Limited ads" onChange={(value) => updateReview(index, 'limited_ads', value)} value={review.limited_ads} />
              <NumberField label="Blocked items" onChange={(value) => updateReview(index, 'blocked_items', value)} value={review.blocked_items} />
            </div>

            <div className="grid gap-component md:grid-cols-2">
              <NotesField
                label="Summary"
                onChange={(value) => updateReview(index, 'summary', value)}
                placeholder="Client-safe summary of the compliance state"
                value={review.summary}
              />
              <NotesField
                label="Risk note"
                onChange={(value) => updateReview(index, 'risk_note', value)}
                placeholder="Policy, claims, privacy, or platform risk"
                value={review.risk_note}
              />
              <NotesField
                label="Next action"
                onChange={(value) => updateReview(index, 'next_action', value)}
                placeholder="What needs to happen next"
                value={review.next_action}
              />
            </div>

            <ComplianceReviewStatusActions
              isDirty={isDirty}
              onApplyStatus={onApplyStatus}
              review={review}
            />

            <PolicyIssuesEditor
              onUpdate={onUpdate}
              review={review}
              reviewIndex={index}
            />
          </section>
        ))}
      </div>
    </WorkspaceCard>
  )
}
