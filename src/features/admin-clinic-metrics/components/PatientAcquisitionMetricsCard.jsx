import { Button } from '@/shared/ui'

import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_ACQUISITION_CHANNEL_META,
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
} from './MetricFields'

function createBlankSnapshot() {
  return {
    attended_appointments: '',
    booked_appointments: '',
    calls: '',
    channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
    chats: '',
    clicks: '',
    data_source: '',
    forms: '',
    impressions: '',
    insight: '',
    landing_page_visits: '',
    location_id: '',
    period_end: '',
    period_label: '',
    period_start: '',
    qualified_inquiries: '',
    service_line_id: '',
    spend: '',
    summary: '',
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

export function PatientAcquisitionMetricsCard({
  draft,
  isDirty,
  locations,
  onPublish,
  onUpdate,
  serviceLines,
}) {
  function updateSnapshot(index, fieldName, value) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      patientAcquisitionSnapshots: currentDraft.patientAcquisitionSnapshots.map((snapshot, snapshotIndex) => (
        snapshotIndex === index ? { ...snapshot, [fieldName]: value } : snapshot
      )),
    }))
  }

  function addSnapshot() {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      patientAcquisitionSnapshots: [
        createBlankSnapshot(),
        ...currentDraft.patientAcquisitionSnapshots,
      ],
    }))
  }

  function removeSnapshot(index) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      patientAcquisitionSnapshots: currentDraft.patientAcquisitionSnapshots.filter((_, snapshotIndex) => (
        snapshotIndex !== index
      )),
    }))
  }

  return (
    <WorkspaceCard
      action={(
        <Button onClick={addSnapshot} size="sm" type="button" variant="outline">
          Add snapshot
        </Button>
      )}
      description="Aggregate only. Do not enter patient names, emails, phone numbers, diagnoses, or record IDs."
      iconName="target"
      title="Patient Acquisition Snapshots"
    >
      <div className="grid gap-component">
        {draft.patientAcquisitionSnapshots.length === 0 ? (
          <p className="rounded-control bg-surface-subtle px-3 py-4 text-ui text-text-muted">
            No acquisition snapshots yet.
          </p>
        ) : null}

        {draft.patientAcquisitionSnapshots.map((snapshot, index) => (
          <section className="grid gap-component rounded-control bg-surface-subtle p-3" key={snapshot.id || `new-acquisition-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-label font-semibold text-text-primary">
                  Snapshot {index + 1}
                </p>
                <p className="text-label text-text-muted">
                  {getPublishLabel(snapshot)}
                  {snapshot.published_at ? ` at ${snapshot.published_at}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!canPublishRecord(snapshot, isDirty)}
                  onClick={() => onPublish({ id: snapshot.id, type: 'patient_acquisition' })}
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
                label="Channel"
                onChange={(value) => updateSnapshot(index, 'channel', value)}
                value={snapshot.channel || CLINIC_ACQUISITION_CHANNELS.OTHER}
              >
                {Object.values(CLINIC_ACQUISITION_CHANNELS).map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {CLINIC_ACQUISITION_CHANNEL_META[channel].label}
                  </SelectItem>
                ))}
              </SelectField>
              <SelectField
                label="Service line"
                onChange={(value) => updateSnapshot(index, 'service_line_id', value)}
                value={snapshot.service_line_id}
              >
                {serviceLines.map((serviceLine) => (
                  <SelectItem key={serviceLine.id} value={serviceLine.id}>
                    {serviceLine.name}
                  </SelectItem>
                ))}
              </SelectField>
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
            </div>

            <div className="grid gap-component md:grid-cols-4">
              <NumberField label="Spend" onChange={(value) => updateSnapshot(index, 'spend', value)} value={snapshot.spend} />
              <NumberField label="Impressions" onChange={(value) => updateSnapshot(index, 'impressions', value)} value={snapshot.impressions} />
              <NumberField label="Clicks" onChange={(value) => updateSnapshot(index, 'clicks', value)} value={snapshot.clicks} />
              <NumberField label="Landing visits" onChange={(value) => updateSnapshot(index, 'landing_page_visits', value)} value={snapshot.landing_page_visits} />
              <NumberField label="Calls" onChange={(value) => updateSnapshot(index, 'calls', value)} value={snapshot.calls} />
              <NumberField label="Forms" onChange={(value) => updateSnapshot(index, 'forms', value)} value={snapshot.forms} />
              <NumberField label="Chats" onChange={(value) => updateSnapshot(index, 'chats', value)} value={snapshot.chats} />
              <NumberField label="Qualified inquiries" onChange={(value) => updateSnapshot(index, 'qualified_inquiries', value)} value={snapshot.qualified_inquiries} />
              <NumberField label="Booked appointments" onChange={(value) => updateSnapshot(index, 'booked_appointments', value)} value={snapshot.booked_appointments} />
              <NumberField label="Attended appointments" onChange={(value) => updateSnapshot(index, 'attended_appointments', value)} value={snapshot.attended_appointments} />
            </div>

            <div className="grid gap-component md:grid-cols-2">
              <TextField
                label="Data source"
                onChange={(value) => updateSnapshot(index, 'data_source', value)}
                placeholder="Manual Google Ads + booking rollup"
                value={snapshot.data_source}
              />
              <NotesField
                label="Summary"
                onChange={(value) => updateSnapshot(index, 'summary', value)}
                placeholder="What this snapshot means for patient acquisition"
                value={snapshot.summary}
              />
              <NotesField
                label="Insight"
                onChange={(value) => updateSnapshot(index, 'insight', value)}
                placeholder="Why the numbers moved"
                value={snapshot.insight}
              />
            </div>
          </section>
        ))}
      </div>
    </WorkspaceCard>
  )
}
