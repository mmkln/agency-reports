import { Button } from '@/shared/ui'

import { WorkspaceCard } from '../../admin-client-workspace'
import {
  CheckboxField,
  SectionEmptyState,
  TextField,
} from './ClinicSetupFields'

function createBlankLocation() {
  return {
    address: '',
    city: '',
    display_order: 0,
    id: '',
    is_active: true,
    name: '',
  }
}

export function ClinicLocationsCard({ draft, onUpdate }) {
  function updateLocation(index, fieldName, value) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      locations: currentDraft.locations.map((location, locationIndex) => (
        locationIndex === index ? { ...location, [fieldName]: value } : location
      )),
    }))
  }

  function addLocation() {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      locations: [...currentDraft.locations, createBlankLocation()],
    }))
  }

  function removeLocation(index) {
    onUpdate((currentDraft) => {
      const removedLocation = currentDraft.locations[index]
      const removedLocationId = removedLocation?.id

      return {
        ...currentDraft,
        locations: currentDraft.locations.filter((_, locationIndex) => locationIndex !== index),
        serviceLines: removedLocationId
          ? currentDraft.serviceLines.map((serviceLine) => ({
            ...serviceLine,
            location_ids: serviceLine.location_ids.filter((locationId) => locationId !== removedLocationId),
          }))
          : currentDraft.serviceLines,
      }
    })
  }

  return (
    <WorkspaceCard
      action={(
        <Button onClick={addLocation} size="sm" type="button" variant="outline">
          Add location
        </Button>
      )}
      description="Locations are used as filters for acquisition, booking, reputation, and compliance rollups."
      iconName="target"
      title="Locations"
    >
      <div className="grid gap-component">
        {draft.locations.length === 0 ? (
          <SectionEmptyState iconName="target" title="No clinic locations yet">
            Add at least one location before assigning service lines to local patient acquisition goals.
          </SectionEmptyState>
        ) : null}

        {draft.locations.map((location, index) => (
          <div className="grid gap-component rounded-control bg-surface-subtle p-3" key={location.id || `new-location-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label font-semibold text-text-primary">
                Location {index + 1}
              </p>
              <Button onClick={() => removeLocation(index)} size="sm" type="button" variant="ghost">
                Remove
              </Button>
            </div>

            <div className="grid gap-component md:grid-cols-2">
              <TextField
                label="Location name"
                onChange={(value) => updateLocation(index, 'name', value)}
                placeholder="e.g. Downtown Clinic"
                required
                value={location.name}
              />
              <TextField
                label="City"
                onChange={(value) => updateLocation(index, 'city', value)}
                placeholder="e.g. Austin"
                value={location.city}
              />
              <TextField
                label="Address"
                onChange={(value) => updateLocation(index, 'address', value)}
                placeholder="Street address or area"
                value={location.address}
              />
              <CheckboxField
                checked={location.is_active !== false}
                label="Active for reporting and campaign setup"
                onChange={(value) => updateLocation(index, 'is_active', value)}
              />
            </div>
          </div>
        ))}
      </div>
    </WorkspaceCard>
  )
}
