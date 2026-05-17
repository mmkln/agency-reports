import { Button } from '@/shared/ui'

import {
  CLINIC_POLICY_ISSUE_STATUSES,
  CLINIC_POLICY_ISSUE_TYPES,
} from '../../../entities/clinic'
import {
  NotesField,
  SelectField,
  SelectItem,
  TextField,
} from './ComplianceFields'

function createBlankIssue() {
  return {
    affected_campaign: '',
    next_action: '',
    platform: '',
    reason: '',
    status: CLINIC_POLICY_ISSUE_STATUSES.OPEN,
    type: CLINIC_POLICY_ISSUE_TYPES.LIMITED_AD,
  }
}

const ISSUE_TYPE_LABELS = Object.freeze({
  [CLINIC_POLICY_ISSUE_TYPES.BLOCKED_AD]: 'Blocked ad',
  [CLINIC_POLICY_ISSUE_TYPES.LIMITED_AD]: 'Limited ad',
  [CLINIC_POLICY_ISSUE_TYPES.MEDICAL_CLAIM]: 'Medical claim',
  [CLINIC_POLICY_ISSUE_TYPES.OTHER]: 'Other',
  [CLINIC_POLICY_ISSUE_TYPES.PRIVACY_TRACKING]: 'Privacy/tracking',
  [CLINIC_POLICY_ISSUE_TYPES.REJECTED_AD]: 'Rejected ad',
})

const ISSUE_STATUS_LABELS = Object.freeze({
  [CLINIC_POLICY_ISSUE_STATUSES.OPEN]: 'Open',
  [CLINIC_POLICY_ISSUE_STATUSES.RESOLVED]: 'Resolved',
})

export function PolicyIssuesEditor({ onUpdate, review, reviewIndex }) {
  const issues = Array.isArray(review.policy_issues) ? review.policy_issues : []

  function updateIssues(updater) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      complianceReviews: currentDraft.complianceReviews.map((currentReview, currentReviewIndex) => (
        currentReviewIndex === reviewIndex
          ? { ...currentReview, policy_issues: updater(issues) }
          : currentReview
      )),
    }))
  }

  function updateIssue(issueIndex, fieldName, value) {
    updateIssues((currentIssues) => currentIssues.map((issue, currentIssueIndex) => (
      currentIssueIndex === issueIndex ? { ...issue, [fieldName]: value } : issue
    )))
  }

  return (
    <div className="grid gap-component rounded-control bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-label font-semibold text-text-primary">Policy issue log</p>
          <p className="text-label font-normal text-text-muted">
            Rejected ads, limited ads, privacy/tracking issues, and claim risks.
          </p>
        </div>
        <Button
          onClick={() => updateIssues((currentIssues) => [createBlankIssue(), ...currentIssues])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add issue
        </Button>
      </div>

      {issues.length === 0 ? (
        <p className="rounded-control bg-surface-subtle px-3 py-4 text-ui text-text-muted">
          No policy issues logged.
        </p>
      ) : null}

      {issues.map((issue, issueIndex) => (
        <div className="grid gap-component rounded-control bg-surface-subtle p-3" key={issue.id || `policy-issue-${issueIndex}`}>
          <div className="flex justify-end">
            <Button
              onClick={() => updateIssues((currentIssues) => currentIssues.filter((_, currentIssueIndex) => currentIssueIndex !== issueIndex))}
              size="sm"
              type="button"
              variant="ghost"
            >
              Remove
            </Button>
          </div>

          <div className="grid gap-component md:grid-cols-4">
            <SelectField
              label="Issue type"
              onChange={(value) => updateIssue(issueIndex, 'type', value)}
              value={issue.type}
            >
              {Object.values(CLINIC_POLICY_ISSUE_TYPES).map((type) => (
                <SelectItem key={type} value={type}>
                  {ISSUE_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectField>
            <SelectField
              label="Status"
              onChange={(value) => updateIssue(issueIndex, 'status', value)}
              value={issue.status}
            >
              {Object.values(CLINIC_POLICY_ISSUE_STATUSES).map((status) => (
                <SelectItem key={status} value={status}>
                  {ISSUE_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectField>
            <TextField
              label="Platform"
              onChange={(value) => updateIssue(issueIndex, 'platform', value)}
              placeholder="Google Ads, Meta, website"
              value={issue.platform}
            />
            <TextField
              label="Affected campaign"
              onChange={(value) => updateIssue(issueIndex, 'affected_campaign', value)}
              placeholder="Implants search"
              value={issue.affected_campaign}
            />
          </div>

          <div className="grid gap-component md:grid-cols-2">
            <NotesField
              label="Reason"
              onChange={(value) => updateIssue(issueIndex, 'reason', value)}
              placeholder="Why this was rejected, limited, or flagged"
              value={issue.reason}
            />
            <NotesField
              label="Next action"
              onChange={(value) => updateIssue(issueIndex, 'next_action', value)}
              placeholder="What needs to happen next"
              value={issue.next_action}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
