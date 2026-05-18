import { SelectItem } from '@/shared/ui'

import {
  CLINIC_PROFILE_SPECIALTIES,
  CLINIC_PROFILE_SPECIALTY_META,
} from '../../../entities/clinic'
import { WorkspaceCard } from '../../admin-client-workspace'
import {
  NotesField,
  SelectField,
  TextField,
} from './ClinicSetupFields'

export function ClinicProfileCard({ draft, onUpdate }) {
  const profile = draft.profile

  function updateProfile(fieldName, value) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      profile: {
        ...currentDraft.profile,
        [fieldName]: value,
      },
    }))
  }

  return (
    <WorkspaceCard
      description="Define the clinic vertical context that powers patient acquisition, booking, and compliance surfaces."
      iconName="stethoscope"
      title="Clinic Profile"
    >
      <div className="grid gap-component md:grid-cols-2">
        <SelectField
          label="Specialty"
          onChange={(value) => updateProfile('specialty', value)}
          value={profile.specialty || CLINIC_PROFILE_SPECIALTIES.OTHER}
        >
          {Object.values(CLINIC_PROFILE_SPECIALTIES).map((specialty) => (
            <SelectItem key={specialty} value={specialty}>
              {CLINIC_PROFILE_SPECIALTY_META[specialty].label}
            </SelectItem>
          ))}
        </SelectField>

        <TextField
          label="Insurance / payment model"
          onChange={(value) => updateProfile('insurance_model', value)}
          placeholder="e.g. private pay, insurance, mixed"
          value={profile.insurance_model}
        />

        <TextField
          label="Primary growth goal"
          onChange={(value) => updateProfile('primary_goal', value)}
          placeholder="e.g. increase booked implant consultations"
          value={profile.primary_goal}
        />

        <NotesField
          label="Capacity notes"
          onChange={(value) => updateProfile('capacity_notes', value)}
          placeholder="e.g. doctor availability, location capacity, seasonal constraints"
          value={profile.capacity_notes}
        />
      </div>
    </WorkspaceCard>
  )
}
