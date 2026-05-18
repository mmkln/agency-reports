import { Button } from '@/shared/ui'

import {
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
import { CallPeakTimesEditor } from './CallPeakTimesEditor'
import { CallBookingSuggestedActionButtons } from './CallBookingSuggestedActionButtons'

function createBlankMetric() {
  return {
    answered_calls: '',
    average_response_seconds: '',
    booked_from_calls: '',
    campaign_name: '',
    data_source: '',
    first_time_calls: '',
    follow_up_needed_count: '',
    form_leads: '',
    insight: '',
    location_id: '',
    missed_calls: '',
    no_response_leads: '',
    not_booked_reasons: [],
    period_end: '',
    period_label: '',
    period_start: '',
    peak_call_times: [],
    service_line_id: '',
    summary: '',
    total_calls: '',
  }
}

function getPublishLabel(record) {
  return CLINIC_RECORD_PUBLISH_STATE_META[
    record.publish_state || CLINIC_RECORD_PUBLISH_STATES.DRAFT
  ].label
}

export function CallBookingMetricsCard({
  createdActionKeys = new Set(),
  creatingActionKey = '',
  draft,
  isDirty,
  locations,
  onCreateSuggestedAction = () => {},
  onPublish,
  onUpdate,
  serviceLines,
}) {
  function updateMetric(index, fieldName, value) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      callBookingMetrics: currentDraft.callBookingMetrics.map((metric, metricIndex) => (
        metricIndex === index ? { ...metric, [fieldName]: value } : metric
      )),
    }))
  }

  function addMetric() {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      callBookingMetrics: [
        createBlankMetric(),
        ...currentDraft.callBookingMetrics,
      ],
    }))
  }

  function removeMetric(index) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      callBookingMetrics: currentDraft.callBookingMetrics.filter((_, metricIndex) => metricIndex !== index),
    }))
  }

  return (
    <WorkspaceCard
      action={(
        <Button onClick={addMetric} size="sm" type="button" variant="outline">
          Add calls snapshot
        </Button>
      )}
      description="Aggregate call handling and booking conversion. Keep front desk notes client-safe and non-identifying."
      iconName="phone"
      title="Calls & Bookings Snapshots"
    >
      <div className="grid gap-component">
        {draft.callBookingMetrics.length === 0 ? (
          <p className="rounded-control bg-surface-subtle px-3 py-4 text-ui text-text-muted">
            No calls and bookings snapshots yet.
          </p>
        ) : null}

        {draft.callBookingMetrics.map((metric, index) => (
          <section className="grid gap-component rounded-control bg-surface-subtle p-3" key={metric.id || `new-call-metric-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-label font-semibold text-text-primary">
                  Calls snapshot {index + 1}
                </p>
                <p className="text-label text-text-muted">
                  {getPublishLabel(metric)}
                  {metric.published_at ? ` at ${metric.published_at}` : ''}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <ClinicPublishReadinessBadge readiness={metric.publish_readiness} />
                  <ClinicPublishReadinessNote readiness={metric.publish_readiness} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!canPublishClinicRecord(metric, isDirty)}
                  onClick={() => onPublish({ id: metric.id, type: 'call_booking' })}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Publish
                </Button>
                <Button onClick={() => removeMetric(index)} size="sm" type="button" variant="ghost">
                  Remove
                </Button>
              </div>
            </div>
            <CallBookingSuggestedActionButtons
              createdActionKeys={createdActionKeys}
              creatingActionKey={creatingActionKey}
              isDirty={isDirty}
              metric={metric}
              onCreateSuggestedAction={onCreateSuggestedAction}
            />

            <div className="grid gap-component md:grid-cols-3">
              <TextField
                label="Period label"
                onChange={(value) => updateMetric(index, 'period_label', value)}
                placeholder="May 2026"
                required
                value={metric.period_label}
              />
              <TextField
                label="Period start"
                onChange={(value) => updateMetric(index, 'period_start', value)}
                required
                type="date"
                value={metric.period_start}
              />
              <TextField
                label="Period end"
                onChange={(value) => updateMetric(index, 'period_end', value)}
                required
                type="date"
                value={metric.period_end}
              />
              <SelectField
                label="Service line"
                onChange={(value) => updateMetric(index, 'service_line_id', value)}
                value={metric.service_line_id}
              >
                {serviceLines.map((serviceLine) => (
                  <SelectItem key={serviceLine.id} value={serviceLine.id}>
                    {serviceLine.name}
                  </SelectItem>
                ))}
              </SelectField>
              <SelectField
                label="Location"
                onChange={(value) => updateMetric(index, 'location_id', value)}
                value={metric.location_id}
              >
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectField>
              <TextField
                label="Data source"
                onChange={(value) => updateMetric(index, 'data_source', value)}
                placeholder="CallRail aggregate export"
                value={metric.data_source}
              />
              <TextField
                label="Campaign"
                onChange={(value) => updateMetric(index, 'campaign_name', value)}
                placeholder="Implants search"
                value={metric.campaign_name}
              />
            </div>

            <div className="grid gap-component md:grid-cols-4">
              <NumberField label="Total calls" onChange={(value) => updateMetric(index, 'total_calls', value)} value={metric.total_calls} />
              <NumberField label="First-time calls" onChange={(value) => updateMetric(index, 'first_time_calls', value)} value={metric.first_time_calls} />
              <NumberField label="Answered calls" onChange={(value) => updateMetric(index, 'answered_calls', value)} value={metric.answered_calls} />
              <NumberField label="Missed calls" onChange={(value) => updateMetric(index, 'missed_calls', value)} value={metric.missed_calls} />
              <NumberField label="Booked from calls" onChange={(value) => updateMetric(index, 'booked_from_calls', value)} value={metric.booked_from_calls} />
              <NumberField label="Form leads" onChange={(value) => updateMetric(index, 'form_leads', value)} value={metric.form_leads} />
              <NumberField label="No-response leads" onChange={(value) => updateMetric(index, 'no_response_leads', value)} value={metric.no_response_leads} />
              <NumberField label="Follow-up needed" onChange={(value) => updateMetric(index, 'follow_up_needed_count', value)} value={metric.follow_up_needed_count} />
              <NumberField label="Average response seconds" onChange={(value) => updateMetric(index, 'average_response_seconds', value)} value={metric.average_response_seconds} />
            </div>

            <CallPeakTimesEditor metric={metric} metricIndex={index} onUpdate={onUpdate} />

            <div className="grid gap-component md:grid-cols-2">
              <NotesField
                label="Summary"
                onChange={(value) => updateMetric(index, 'summary', value)}
                placeholder="What this period says about booking performance"
                value={metric.summary}
              />
              <NotesField
                label="Insight"
                onChange={(value) => updateMetric(index, 'insight', value)}
                placeholder="Where patients are being lost or recovered"
                value={metric.insight}
              />
            </div>
          </section>
        ))}
      </div>
    </WorkspaceCard>
  )
}
