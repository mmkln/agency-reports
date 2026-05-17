import { Button } from '@/shared/ui'

import {
  CLINIC_RECORD_PUBLISH_STATE_META,
  CLINIC_RECORD_PUBLISH_STATES,
} from '../../../entities/clinic'
import { WorkspaceCard } from '../../admin-client-workspace'
import {
  NotesField,
  NumberField,
  SelectField,
  SelectItem,
  TextField,
} from './ReputationFields'

function createBlankSnapshot() {
  return {
    data_source: '',
    gbp_updates: '',
    google_rating: '',
    insight: '',
    local_visibility_note: '',
    location_id: '',
    negative_reviews: '',
    period_end: '',
    period_label: '',
    period_start: '',
    provider_profile_completeness: '',
    review_count: '',
    review_request_sent: '',
    review_response_drafts: '',
    reviews_gained: '',
    summary: '',
    unanswered_reviews: '',
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

export function ReputationSnapshotsCard({
  draft,
  isDirty,
  locations,
  onPublish,
  onUpdate,
}) {
  function updateSnapshot(index, fieldName, value) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      reputationSnapshots: currentDraft.reputationSnapshots.map((snapshot, snapshotIndex) => (
        snapshotIndex === index ? { ...snapshot, [fieldName]: value } : snapshot
      )),
    }))
  }

  function addSnapshot() {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      reputationSnapshots: [
        createBlankSnapshot(),
        ...currentDraft.reputationSnapshots,
      ],
    }))
  }

  function removeSnapshot(index) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      reputationSnapshots: currentDraft.reputationSnapshots.filter((_, snapshotIndex) => snapshotIndex !== index),
    }))
  }

  return (
    <WorkspaceCard
      action={(
        <Button onClick={addSnapshot} size="sm" type="button" variant="outline">
          Add snapshot
        </Button>
      )}
      description="Aggregate reputation, review, and local presence data. Keep review notes non-identifying."
      iconName="messageSquare"
      title="Reputation Snapshots"
    >
      <div className="grid gap-component">
        {draft.reputationSnapshots.length === 0 ? (
          <p className="rounded-control bg-surface-subtle px-3 py-4 text-ui text-text-muted">
            No reputation snapshots yet.
          </p>
        ) : null}

        {draft.reputationSnapshots.map((snapshot, index) => (
          <section className="grid gap-component rounded-control bg-surface-subtle p-3" key={snapshot.id || `new-reputation-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-label font-semibold text-text-primary">
                  Reputation snapshot {index + 1}
                </p>
                <p className="text-label text-text-muted">
                  {getPublishLabel(snapshot)}
                  {snapshot.published_at ? ` at ${snapshot.published_at}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!canPublishRecord(snapshot, isDirty)}
                  onClick={() => onPublish({ id: snapshot.id })}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Publish
                </Button>
                <Button onClick={() => removeSnapshot(index)} size="sm" type="button" variant="ghost">
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-component md:grid-cols-3">
              <TextField
                label="Period label"
                onChange={(value) => updateSnapshot(index, 'period_label', value)}
                placeholder="May 2026"
                required
                value={snapshot.period_label}
              />
              <TextField
                label="Period start"
                onChange={(value) => updateSnapshot(index, 'period_start', value)}
                required
                type="date"
                value={snapshot.period_start}
              />
              <TextField
                label="Period end"
                onChange={(value) => updateSnapshot(index, 'period_end', value)}
                required
                type="date"
                value={snapshot.period_end}
              />
              <SelectField
                label="Location"
                onChange={(value) => updateSnapshot(index, 'location_id', value)}
                value={snapshot.location_id}
              >
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectField>
              <TextField
                label="Data source"
                onChange={(value) => updateSnapshot(index, 'data_source', value)}
                placeholder="Manual GBP rollup"
                value={snapshot.data_source}
              />
            </div>

            <div className="grid gap-component md:grid-cols-4">
              <NumberField
                label="Google rating"
                max="5"
                onChange={(value) => updateSnapshot(index, 'google_rating', value)}
                step="0.1"
                value={snapshot.google_rating}
              />
              <NumberField label="Review count" onChange={(value) => updateSnapshot(index, 'review_count', value)} value={snapshot.review_count} />
              <NumberField label="Reviews gained" onChange={(value) => updateSnapshot(index, 'reviews_gained', value)} value={snapshot.reviews_gained} />
              <NumberField label="Unanswered reviews" onChange={(value) => updateSnapshot(index, 'unanswered_reviews', value)} value={snapshot.unanswered_reviews} />
              <NumberField label="Negative reviews" onChange={(value) => updateSnapshot(index, 'negative_reviews', value)} value={snapshot.negative_reviews} />
              <NumberField label="Review response drafts" onChange={(value) => updateSnapshot(index, 'review_response_drafts', value)} value={snapshot.review_response_drafts} />
              <NumberField label="Review requests sent" onChange={(value) => updateSnapshot(index, 'review_request_sent', value)} value={snapshot.review_request_sent} />
              <NumberField label="GBP updates" onChange={(value) => updateSnapshot(index, 'gbp_updates', value)} value={snapshot.gbp_updates} />
              <NumberField
                label="Profile completeness"
                max="100"
                onChange={(value) => updateSnapshot(index, 'provider_profile_completeness', value)}
                value={snapshot.provider_profile_completeness}
              />
            </div>

            <div className="grid gap-component md:grid-cols-2">
              <NotesField
                label="Summary"
                onChange={(value) => updateSnapshot(index, 'summary', value)}
                placeholder="What changed in reputation this period"
                value={snapshot.summary}
              />
              <NotesField
                label="Local visibility note"
                onChange={(value) => updateSnapshot(index, 'local_visibility_note', value)}
                placeholder="Map pack, local search, GBP profile, or provider profile context"
                value={snapshot.local_visibility_note}
              />
              <NotesField
                label="Insight"
                onChange={(value) => updateSnapshot(index, 'insight', value)}
                placeholder="Why reputation moved and what should happen next"
                value={snapshot.insight}
              />
            </div>
          </section>
        ))}
      </div>
    </WorkspaceCard>
  )
}
