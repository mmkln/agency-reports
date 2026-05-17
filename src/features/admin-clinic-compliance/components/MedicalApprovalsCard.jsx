import { Button } from '@/shared/ui'

import {
  CLINIC_APPROVAL_STATUSES,
  CLINIC_APPROVAL_STATUS_META,
  CLINIC_APPROVAL_TYPES,
  CLINIC_APPROVAL_TYPE_META,
} from '../../../entities/clinic'
import { getMedicalApprovalDecisionCapabilities } from '../../../domain/services/adminClinicComplianceService'
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

function getStatusLabel(status) {
  return CLINIC_APPROVAL_STATUS_META[status]?.label
    ?? CLINIC_APPROVAL_STATUS_META[CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW].label
}

function getDecisionTimestampSummary(approval) {
  if (approval.approved_at) {
    return `Approved at ${approval.approved_at}`
  }

  if (approval.changes_requested_at) {
    return `Changes requested at ${approval.changes_requested_at}`
  }

  return 'No decision timestamp yet'
}

export function MedicalApprovalsCard({
  draft,
  isDirty,
  locations,
  onApplyDecision,
  onUpdate,
  serviceLines,
}) {
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

  function applyDecision(action, approval) {
    onApplyDecision({
      action,
      approvalId: approval.id,
      comment: approval.decision_comment,
      version: approval.version,
    })
  }

  return (
    <WorkspaceCard
      action={(
        <Button onClick={addApproval} size="sm" type="button" variant="outline">
          Add approval
        </Button>
      )}
      description="Medical, legal, and platform-sensitive approval records with auditable decision history."
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
          <ApprovalEditor
            approval={approval}
            index={index}
            isDirty={isDirty}
            key={approval.id || `new-approval-${index}`}
            locations={locations}
            onApplyDecision={applyDecision}
            onRemove={removeApproval}
            onUpdate={updateApproval}
            serviceLines={serviceLines}
          />
        ))}
      </div>
    </WorkspaceCard>
  )
}

function ApprovalEditor({
  approval,
  index,
  isDirty,
  locations,
  onApplyDecision,
  onRemove,
  onUpdate,
  serviceLines,
}) {
  const capabilities = getMedicalApprovalDecisionCapabilities(approval)
  const needsComment = !approval.decision_comment

  return (
    <section className="grid gap-component rounded-control bg-surface-subtle p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-label font-semibold text-text-primary">
            Approval {index + 1}
          </p>
          <p className="text-label text-text-muted">
            Status: {getStatusLabel(approval.status)}
          </p>
        </div>
        <Button onClick={() => onRemove(index)} size="sm" type="button" variant="ghost">
          Remove
        </Button>
      </div>

      <div className="grid gap-component md:grid-cols-3">
        <TextField
          label="Title"
          onChange={(value) => onUpdate(index, 'title', value)}
          placeholder="Implant success-rate claim"
          required
          value={approval.title}
        />
        <SelectField
          label="Type"
          onChange={(value) => onUpdate(index, 'approval_type', value)}
          value={approval.approval_type || CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM}
        >
          {Object.values(CLINIC_APPROVAL_TYPES).map((type) => (
            <SelectItem key={type} value={type}>
              {CLINIC_APPROVAL_TYPE_META[type].label}
            </SelectItem>
          ))}
        </SelectField>
        <TextField
          label="Version"
          onChange={(value) => onUpdate(index, 'version', value)}
          placeholder="v1"
          value={approval.version}
        />
        <TextField
          label="Due date"
          onChange={(value) => onUpdate(index, 'due_date', value)}
          type="date"
          value={approval.due_date}
        />
        <SelectField
          label="Service line"
          onChange={(value) => onUpdate(index, 'service_line_id', value)}
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
          onChange={(value) => onUpdate(index, 'location_id', value)}
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
          onChange={(value) => onUpdate(index, 'requested_by_label', value)}
          placeholder="Agency team"
          value={approval.requested_by_label}
        />
        <TextField
          label="Approver"
          onChange={(value) => onUpdate(index, 'approver_label', value)}
          placeholder="Doctor, legal, or clinic owner"
          value={approval.approver_label}
        />
      </div>

      <p className="text-label text-text-muted">
        {getDecisionTimestampSummary(approval)}
      </p>

      <div className="grid gap-component md:grid-cols-2">
        <NotesField
          label="Instructions"
          onChange={(value) => onUpdate(index, 'instructions', value)}
          placeholder="What exactly needs medical or policy review"
          value={approval.instructions}
        />
        <NotesField
          label="Decision comment"
          onChange={(value) => onUpdate(index, 'decision_comment', value)}
          placeholder="Client-safe decision note"
          value={approval.decision_comment}
        />
      </div>

      <div className="grid gap-3 rounded-control bg-surface px-3 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-label font-semibold text-text-primary">
              Decision actions
            </p>
            <p className="text-label text-text-muted">
              {approval.id
                ? 'Use these actions to preserve status history and timestamps.'
                : 'Save this approval before recording a decision.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={!approval.id || isDirty || !capabilities.canApprove}
              onClick={() => onApplyDecision('approve', approval)}
              size="sm"
              type="button"
            >
              Approve
            </Button>
            <Button
              disabled={!approval.id || isDirty || !capabilities.canRequestChanges || needsComment}
              onClick={() => onApplyDecision('request_changes', approval)}
              size="sm"
              type="button"
              variant="outline"
            >
              Request changes
            </Button>
            <Button
              disabled={!approval.id || isDirty || !capabilities.canReject || needsComment}
              onClick={() => onApplyDecision('reject', approval)}
              size="sm"
              type="button"
              variant="destructive"
            >
              Reject
            </Button>
          </div>
        </div>
        {isDirty && approval.id ? (
          <p className="text-label text-text-muted">
            Save compliance changes before recording a decision.
          </p>
        ) : null}
      </div>
    </section>
  )
}
