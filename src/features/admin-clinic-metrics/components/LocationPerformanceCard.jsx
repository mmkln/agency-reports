import { Button } from '@/shared/ui'

import {
  CLINIC_COMPLIANCE_STATUS_META,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_RECORD_PUBLISH_STATE_META,
  CLINIC_RECORD_PUBLISH_STATES,
} from '../../../entities/clinic'
import { WorkspaceCard } from '../../admin-client-workspace'
import {
  canPublishClinicRecord,
  ClinicPublishReadinessBadge,
  ClinicPublishReadinessNote,
} from '../../admin-clinic-publish'
import {
  NotesField,
  NumberField,
  SelectField,
  SelectItem,
  TextField,
} from './MetricFields'

function createBlankPerformance() {
  return {
    answered_calls: '',
    booked_appointments: '',
    compliance_status: CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
    cost_per_booked_appointment: '',
    data_source: '',
    google_rating: '',
    inquiries: '',
    insight: '',
    location_id: '',
    missed_calls: '',
    period_end: '',
    period_label: '',
    period_start: '',
    review_count: '',
    reviews_gained: '',
    spend: '',
    summary: '',
  }
}

function getPublishLabel(record) {
  return CLINIC_RECORD_PUBLISH_STATE_META[
    record.publish_state || CLINIC_RECORD_PUBLISH_STATES.DRAFT
  ].label
}

export function LocationPerformanceCard({
  draft,
  isDirty,
  locations,
  onPublish,
  onUpdate,
}) {
  function updatePerformance(index, fieldName, value) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      locationPerformance: currentDraft.locationPerformance.map((performance, performanceIndex) => (
        performanceIndex === index ? { ...performance, [fieldName]: value } : performance
      )),
    }))
  }

  function addPerformance() {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      locationPerformance: [
        createBlankPerformance(),
        ...currentDraft.locationPerformance,
      ],
    }))
  }

  function removePerformance(index) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      locationPerformance: currentDraft.locationPerformance.filter((_, performanceIndex) => performanceIndex !== index),
    }))
  }

  return (
    <WorkspaceCard
      action={(
        <Button onClick={addPerformance} size="sm" type="button" variant="outline">
          Add location
        </Button>
      )}
      description="Aggregate rollup for multi-location clinic views: bookings, calls, spend, reviews, and compliance by location."
      iconName="target"
      title="Location Performance"
    >
      <div className="grid gap-component">
        {draft.locationPerformance.length === 0 ? (
          <p className="rounded-control bg-surface-subtle px-3 py-4 text-ui text-text-muted">
            No location performance records yet.
          </p>
        ) : null}

        {draft.locationPerformance.map((performance, index) => (
          <section className="grid gap-component rounded-control bg-surface-subtle p-3" key={performance.id || `new-location-performance-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-label font-semibold text-text-primary">
                  Location performance {index + 1}
                </p>
                <p className="text-label text-text-muted">
                  {getPublishLabel(performance)}
                  {performance.published_at ? ` at ${performance.published_at}` : ''}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <ClinicPublishReadinessBadge readiness={performance.publish_readiness} />
                  <ClinicPublishReadinessNote readiness={performance.publish_readiness} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!canPublishClinicRecord(performance, isDirty)}
                  onClick={() => onPublish({ id: performance.id, type: 'location_performance' })}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Publish
                </Button>
                <Button onClick={() => removePerformance(index)} size="sm" type="button" variant="ghost">
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-component md:grid-cols-3">
              <TextField label="Period label" onChange={(value) => updatePerformance(index, 'period_label', value)} placeholder="May 2026" required value={performance.period_label} />
              <TextField label="Period start" onChange={(value) => updatePerformance(index, 'period_start', value)} required type="date" value={performance.period_start} />
              <TextField label="Period end" onChange={(value) => updatePerformance(index, 'period_end', value)} required type="date" value={performance.period_end} />
              <SelectField label="Location" onChange={(value) => updatePerformance(index, 'location_id', value)} value={performance.location_id}>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectField>
              <SelectField
                label="Compliance status"
                onChange={(value) => updatePerformance(index, 'compliance_status', value)}
                value={performance.compliance_status || CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED}
              >
                {Object.values(CLINIC_COMPLIANCE_STATUSES).map((status) => (
                  <SelectItem key={status} value={status}>
                    {CLINIC_COMPLIANCE_STATUS_META[status].label}
                  </SelectItem>
                ))}
              </SelectField>
              <TextField label="Data source" onChange={(value) => updatePerformance(index, 'data_source', value)} placeholder="Multi-location aggregate export" value={performance.data_source} />
            </div>

            <div className="grid gap-component md:grid-cols-4">
              <NumberField label="Spend" onChange={(value) => updatePerformance(index, 'spend', value)} value={performance.spend} />
              <NumberField label="Inquiries" onChange={(value) => updatePerformance(index, 'inquiries', value)} value={performance.inquiries} />
              <NumberField label="Booked appointments" onChange={(value) => updatePerformance(index, 'booked_appointments', value)} value={performance.booked_appointments} />
              <NumberField label="Cost per booking" onChange={(value) => updatePerformance(index, 'cost_per_booked_appointment', value)} value={performance.cost_per_booked_appointment} />
              <NumberField label="Answered calls" onChange={(value) => updatePerformance(index, 'answered_calls', value)} value={performance.answered_calls} />
              <NumberField label="Missed calls" onChange={(value) => updatePerformance(index, 'missed_calls', value)} value={performance.missed_calls} />
              <NumberField label="Google rating" max="5" onChange={(value) => updatePerformance(index, 'google_rating', value)} step="0.1" value={performance.google_rating} />
              <NumberField label="Review count" onChange={(value) => updatePerformance(index, 'review_count', value)} value={performance.review_count} />
              <NumberField label="Reviews gained" onChange={(value) => updatePerformance(index, 'reviews_gained', value)} value={performance.reviews_gained} />
            </div>

            <div className="grid gap-component md:grid-cols-2">
              <NotesField label="Summary" onChange={(value) => updatePerformance(index, 'summary', value)} placeholder="How this location is performing" value={performance.summary} />
              <NotesField label="Insight" onChange={(value) => updatePerformance(index, 'insight', value)} placeholder="Location-specific bottleneck or opportunity" value={performance.insight} />
            </div>
          </section>
        ))}
      </div>
    </WorkspaceCard>
  )
}
