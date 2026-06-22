import { Button } from '@/shared/ui'

import {
  CLINIC_CAMPAIGN_STATUS_META,
  CLINIC_CAMPAIGN_STATUSES,
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
    ad_approval_status: '',
    booked_appointments: '',
    campaign_name: '',
    campaign_status: CLINIC_CAMPAIGN_STATUSES.PLANNED,
    capacity_note: '',
    compliance_status: CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
    cost_per_booked_appointment: '',
    cost_per_inquiry: '',
    data_source: '',
    inquiries: '',
    insight: '',
    landing_page_status: '',
    location_id: '',
    period_end: '',
    period_label: '',
    period_start: '',
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

export function ServiceLinePerformanceCard({
  draft,
  isDirty,
  locations,
  onPublish,
  onUpdate,
  serviceLines,
}) {
  function updatePerformance(index, fieldName, value) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      serviceLinePerformance: currentDraft.serviceLinePerformance.map((performance, performanceIndex) => (
        performanceIndex === index ? { ...performance, [fieldName]: value } : performance
      )),
    }))
  }

  function addPerformance() {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      serviceLinePerformance: [
        createBlankPerformance(),
        ...currentDraft.serviceLinePerformance,
      ],
    }))
  }

  function removePerformance(index) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      serviceLinePerformance: currentDraft.serviceLinePerformance.filter((_, performanceIndex) => (
        performanceIndex !== index
      )),
    }))
  }

  return (
    <WorkspaceCard
      action={(
        <Button onClick={addPerformance} size="sm" type="button" variant="outline">
          Add service line
        </Button>
      )}
      description="Aggregate service-line performance by campaign, location, and compliance status. Do not enter patient-level data."
      iconName="stethoscope"
      title="Service Line Performance"
    >
      <div className="grid gap-component">
        {draft.serviceLinePerformance.length === 0 ? (
          <p className="rounded-control bg-surface-subtle px-3 py-4 text-ui text-text-muted">
            No service line performance records yet.
          </p>
        ) : null}

        {draft.serviceLinePerformance.map((performance, index) => (
          <section className="grid gap-component rounded-control bg-surface-subtle p-3" key={performance.id || `new-service-performance-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-label font-semibold text-text-primary">
                  Service line performance {index + 1}
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
                  onClick={() => onPublish({ id: performance.id, type: 'service_line_performance' })}
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
              <TextField
                label="Period label"
                onChange={(value) => updatePerformance(index, 'period_label', value)}
                placeholder="May 2026"
                required
                value={performance.period_label}
              />
              <TextField
                label="Period start"
                onChange={(value) => updatePerformance(index, 'period_start', value)}
                required
                type="date"
                value={performance.period_start}
              />
              <TextField
                label="Period end"
                onChange={(value) => updatePerformance(index, 'period_end', value)}
                required
                type="date"
                value={performance.period_end}
              />
              <SelectField
                label="Service line"
                onChange={(value) => updatePerformance(index, 'service_line_id', value)}
                value={performance.service_line_id}
              >
                {serviceLines.map((serviceLine) => (
                  <SelectItem key={serviceLine.id} value={serviceLine.id}>
                    {serviceLine.name}
                  </SelectItem>
                ))}
              </SelectField>
              <SelectField
                label="Location"
                onChange={(value) => updatePerformance(index, 'location_id', value)}
                value={performance.location_id}
              >
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectField>
              <TextField
                label="Campaign"
                onChange={(value) => updatePerformance(index, 'campaign_name', value)}
                placeholder="Implants search"
                value={performance.campaign_name}
              />
              <SelectField
                label="Campaign status"
                onChange={(value) => updatePerformance(index, 'campaign_status', value)}
                value={performance.campaign_status || CLINIC_CAMPAIGN_STATUSES.PLANNED}
              >
                {Object.values(CLINIC_CAMPAIGN_STATUSES).map((status) => (
                  <SelectItem key={status} value={status}>
                    {CLINIC_CAMPAIGN_STATUS_META[status].label}
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
              <TextField
                label="Data source"
                onChange={(value) => updatePerformance(index, 'data_source', value)}
                placeholder="Manual service line rollup"
                value={performance.data_source}
              />
            </div>

            <div className="grid gap-component md:grid-cols-4">
              <NumberField label="Spend" onChange={(value) => updatePerformance(index, 'spend', value)} value={performance.spend} />
              <NumberField label="Inquiries" onChange={(value) => updatePerformance(index, 'inquiries', value)} value={performance.inquiries} />
              <NumberField label="Booked appointments" onChange={(value) => updatePerformance(index, 'booked_appointments', value)} value={performance.booked_appointments} />
              <NumberField label="Cost per inquiry" onChange={(value) => updatePerformance(index, 'cost_per_inquiry', value)} value={performance.cost_per_inquiry} />
              <NumberField label="Cost per booking" onChange={(value) => updatePerformance(index, 'cost_per_booked_appointment', value)} value={performance.cost_per_booked_appointment} />
              <TextField label="Landing page status" onChange={(value) => updatePerformance(index, 'landing_page_status', value)} value={performance.landing_page_status} />
              <TextField label="Ad approval status" onChange={(value) => updatePerformance(index, 'ad_approval_status', value)} value={performance.ad_approval_status} />
            </div>

            <div className="grid gap-component md:grid-cols-2">
              <NotesField
                label="Summary"
                onChange={(value) => updatePerformance(index, 'summary', value)}
                placeholder="How this service line is performing"
                value={performance.summary}
              />
              <NotesField
                label="Capacity note"
                onChange={(value) => updatePerformance(index, 'capacity_note', value)}
                placeholder="Capacity constraints or service-line availability"
                value={performance.capacity_note}
              />
              <NotesField
                label="Insight"
                onChange={(value) => updatePerformance(index, 'insight', value)}
                placeholder="Why performance moved or what needs action"
                value={performance.insight}
              />
            </div>
          </section>
        ))}
      </div>
    </WorkspaceCard>
  )
}
