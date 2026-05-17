import { Button } from '@/shared/ui'

import {
  CLINIC_APPROVAL_STATUSES,
  CLINIC_APPROVAL_STATUS_META,
  CLINIC_APPROVAL_TYPES,
  CLINIC_APPROVAL_TYPE_META,
} from '../../../entities/clinic'
import { WorkspaceCard } from '../../admin-client-workspace'
import {
  NotesField,
  SelectField,
  SelectItem,
  TextField,
} from './ComplianceFields'

function createBlankApproval() {
  return {
    approval_type: CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
    approved_at: '',
    approver_label: '',
    changes_requested_at: '',
    decision_comment: '',
    due_date: '',
    history: [],
    instructions: '',
    location_id: '',
    requested_by_label: '',
    service_line_id: '',
    status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
    title: '',
    version: '',
  }
}

export function MedicalApprovalsCard({ draft, locations, onUpdate, serviceLines }) {
  function updateApproval(index, fieldName, value) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      medicalApprovals: currentDraft.medicalApprovals.map((approval, approvalIndex) => (
        approvalIndex === index ? { ...approval, [fieldName]: value } : approval
      )),
    }))
  }

  function addApproval() {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      medicalApprovals: [
        createBlankApproval(),
        ...currentDraft.medicalApprovals,
      ],
    }))
  }

  function removeApproval(index) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      medicalApprovals: currentDraft.medicalApprovals.filter((_, approvalIndex) => approvalIndex !== index),
    }))
  }

  return (
    <WorkspaceCard
      action={(
        <Button onClick={addApproval} size="sm" type="button" variant="outline">
          Add approval
        </Button>
      )}
      description="Medical, legal, and platform-sensitive approval records. Transitions will get a dedicated decision flow next."
      iconName="checkCircle2"
      title="Medical Approvals"
    >
      <div className="grid gap-component">
        {draft.medicalApprovals.length === 0 ? (
          <p className="rounded-control bg-surface-subtle px-3 py-4 text-ui text-text-muted">
            No medical approvals yet.
          </p>
        ) : null}

        {draft.medicalApprovals.map((approval, index) => (
          <section className="grid gap-component rounded-control bg-surface-subtle p-3" key={approval.id || `new-approval-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label font-semibold text-text-primary">
                Approval {index + 1}
              </p>
              <Button onClick={() => removeApproval(index)} size="sm" type="button" variant="ghost">
                Remove
              </Button>
            </div>

            <div className="grid gap-component md:grid-cols-3">
              <TextField
                label="Title"
                onChange={(value) => updateApproval(index, 'title', value)}
                placeholder="Implant success-rate claim"
                required
                value={approval.title}
              />
              <SelectField
                label="Type"
                onChange={(value) => updateApproval(index, 'approval_type', value)}
                value={approval.approval_type || CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM}
              >
                {Object.values(CLINIC_APPROVAL_TYPES).map((type) => (
                  <SelectItem key={type} value={type}>
                    {CLINIC_APPROVAL_TYPE_META[type].label}
                  </SelectItem>
                ))}
              </SelectField>
              <SelectField
                label="Status"
                onChange={(value) => updateApproval(index, 'status', value)}
                value={approval.status || CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW}
              >
                {Object.values(CLINIC_APPROVAL_STATUSES).map((status) => (
                  <SelectItem key={status} value={status}>
                    {CLINIC_APPROVAL_STATUS_META[status].label}
                  </SelectItem>
                ))}
              </SelectField>
              <TextField
                label="Version"
                onChange={(value) => updateApproval(index, 'version', value)}
                placeholder="v1"
                value={approval.version}
              />
              <TextField
                label="Due date"
                onChange={(value) => updateApproval(index, 'due_date', value)}
                type="date"
                value={approval.due_date}
              />
              <SelectField
                label="Service line"
                onChange={(value) => updateApproval(index, 'service_line_id', value)}
                value={approval.service_line_id}
              >
                {serviceLines.map((serviceLine) => (
                  <SelectItem key={serviceLine.id} value={serviceLine.id}>
                    {serviceLine.name}
                  </SelectItem>
                ))}
              </SelectField>
              <SelectField
                label="Location"
                onChange={(value) => updateApproval(index, 'location_id', value)}
                value={approval.location_id}
              >
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectField>
              <TextField
                label="Requested by"
                onChange={(value) => updateApproval(index, 'requested_by_label', value)}
                placeholder="Agency team"
                value={approval.requested_by_label}
              />
              <TextField
                label="Approver"
                onChange={(value) => updateApproval(index, 'approver_label', value)}
                placeholder="Doctor, legal, or clinic owner"
                value={approval.approver_label}
              />
            </div>

            <div className="grid gap-component md:grid-cols-2">
              <TextField
                label="Approved at"
                onChange={(value) => updateApproval(index, 'approved_at', value)}
                type="datetime-local"
                value={approval.approved_at}
              />
              <TextField
                label="Changes requested at"
                onChange={(value) => updateApproval(index, 'changes_requested_at', value)}
                type="datetime-local"
                value={approval.changes_requested_at}
              />
              <NotesField
                label="Instructions"
                onChange={(value) => updateApproval(index, 'instructions', value)}
                placeholder="What exactly needs medical or policy review"
                value={approval.instructions}
              />
              <NotesField
                label="Decision comment"
                onChange={(value) => updateApproval(index, 'decision_comment', value)}
                placeholder="Client-safe decision note"
                value={approval.decision_comment}
              />
            </div>
          </section>
        ))}
      </div>
    </WorkspaceCard>
  )
}
