import { Button, SelectItem } from '@/shared/ui'

import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_ACQUISITION_CHANNEL_META,
  CLINIC_SERVICE_LINE_STATUSES,
  CLINIC_SERVICE_LINE_STATUS_META,
} from '../../../entities/clinic'
import { WorkspaceCard } from '../../admin-client-workspace'
import {
  CheckboxField,
  NotesField,
  NumberField,
  SectionEmptyState,
  SelectField,
  TextField,
} from './ClinicSetupFields'

function createBlankServiceLine() {
  return {
    average_value: '',
    capacity_note: '',
    display_order: 0,
    id: '',
    location_ids: [],
    name: '',
    primary_channel: '',
    status: CLINIC_SERVICE_LINE_STATUSES.PLANNED,
    target_monthly_bookings: '',
  }
}

export function ClinicServiceLinesCard({ draft, onUpdate }) {
  function updateServiceLine(index, fieldName, value) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      serviceLines: currentDraft.serviceLines.map((serviceLine, serviceLineIndex) => (
        serviceLineIndex === index ? { ...serviceLine, [fieldName]: value } : serviceLine
      )),
    }))
  }

  function toggleLocation(index, locationId, isSelected) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      serviceLines: currentDraft.serviceLines.map((serviceLine, serviceLineIndex) => {
        if (serviceLineIndex !== index) {
          return serviceLine
        }

        const currentLocationIds = new Set(serviceLine.location_ids)

        if (isSelected) {
          currentLocationIds.add(locationId)
        } else {
          currentLocationIds.delete(locationId)
        }

        return {
          ...serviceLine,
          location_ids: [...currentLocationIds],
        }
      }),
    }))
  }

  function addServiceLine() {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      serviceLines: [...currentDraft.serviceLines, createBlankServiceLine()],
    }))
  }

  function removeServiceLine(index) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      serviceLines: currentDraft.serviceLines.filter((_, serviceLineIndex) => serviceLineIndex !== index),
    }))
  }

  return (
    <WorkspaceCard
      action={(
        <Button onClick={addServiceLine} size="sm" type="button" variant="outline">
          Add service line
        </Button>
      )}
      description="Service lines define what the clinic is trying to sell, book, and keep compliant."
      iconName="stethoscope"
      title="Service Lines"
    >
      <div className="grid gap-component">
        {draft.serviceLines.length === 0 ? (
          <SectionEmptyState iconName="stethoscope" title="No service lines yet">
            Add services such as implants, IVF consults, dermatology visits, urgent care, or physiotherapy.
          </SectionEmptyState>
        ) : null}

        {draft.serviceLines.map((serviceLine, index) => (
          <div className="grid gap-component rounded-control bg-surface-subtle p-3" key={serviceLine.id || `new-service-line-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label font-semibold text-text-primary">
                Service line {index + 1}
              </p>
              <Button onClick={() => removeServiceLine(index)} size="sm" type="button" variant="ghost">
                Remove
              </Button>
            </div>

            <div className="grid gap-component md:grid-cols-2">
              <TextField
                label="Service line"
                onChange={(value) => updateServiceLine(index, 'name', value)}
                placeholder="e.g. Dental implants"
                required
                value={serviceLine.name}
              />
              <SelectField
                label="Status"
                onChange={(value) => updateServiceLine(index, 'status', value)}
                value={serviceLine.status || CLINIC_SERVICE_LINE_STATUSES.PLANNED}
              >
                {Object.values(CLINIC_SERVICE_LINE_STATUSES).map((status) => (
                  <SelectItem key={status} value={status}>
                    {CLINIC_SERVICE_LINE_STATUS_META[status].label}
                  </SelectItem>
                ))}
              </SelectField>
              <SelectField
                label="Primary channel"
                onChange={(value) => updateServiceLine(index, 'primary_channel', value)}
                value={serviceLine.primary_channel || CLINIC_ACQUISITION_CHANNELS.OTHER}
              >
                {Object.values(CLINIC_ACQUISITION_CHANNELS).map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {CLINIC_ACQUISITION_CHANNEL_META[channel].label}
                  </SelectItem>
                ))}
              </SelectField>
              <NumberField
                label="Monthly booking target"
                onChange={(value) => updateServiceLine(index, 'target_monthly_bookings', value)}
                placeholder="20"
                value={serviceLine.target_monthly_bookings}
              />
              <NumberField
                label="Average appointment value"
                onChange={(value) => updateServiceLine(index, 'average_value', value)}
                placeholder="4200"
                value={serviceLine.average_value}
              />
              <NotesField
                label="Capacity note"
                onChange={(value) => updateServiceLine(index, 'capacity_note', value)}
                placeholder="Doctor availability, chair capacity, or service constraints"
                value={serviceLine.capacity_note}
              />
            </div>

            <div className="grid gap-2">
              <p className="text-label text-text-muted">Locations</p>
              {draft.locations.length === 0 ? (
                <p className="text-ui text-text-muted">Add clinic locations before assigning this service line.</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {draft.locations.map((location) => (
                    <CheckboxField
                      checked={Boolean(location.id) && serviceLine.location_ids.includes(location.id)}
                      disabled={!location.id}
                      key={location.id || location.name}
                      label={location.id ? (location.name || 'Unnamed location') : `${location.name || 'New location'} (save first)`}
                      onChange={(value) => toggleLocation(index, location.id, value)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </WorkspaceCard>
  )
}
