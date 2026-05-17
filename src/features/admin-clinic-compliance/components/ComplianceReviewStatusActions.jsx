import { Button } from '@/shared/ui'

import { CLINIC_COMPLIANCE_STATUSES } from '../../../entities/clinic'
import { getComplianceReviewTransitionCapabilities } from '../../../domain/services/adminClinicComplianceService'

export function ComplianceReviewStatusActions({
  isDirty,
  onApplyStatus,
  review,
}) {
  const capabilities = getComplianceReviewTransitionCapabilities(review)

  if (!review.id) {
    return null
  }

  return (
    <div className="grid gap-3 rounded-control bg-surface px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-label font-semibold text-text-primary">Status actions</p>
          <p className="text-label text-text-muted">
            Use these actions so status changes keep history and timestamps.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={isDirty || !capabilities.canMarkInReview}
            onClick={() => onApplyStatus({
              nextStatus: CLINIC_COMPLIANCE_STATUSES.IN_REVIEW,
              reviewId: review.id,
            })}
            size="sm"
            type="button"
            variant="outline"
          >
            In review
          </Button>
          <Button
            disabled={isDirty || !capabilities.canFlagRisk}
            onClick={() => onApplyStatus({
              nextStatus: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
              reviewId: review.id,
            })}
            size="sm"
            type="button"
            variant="outline"
          >
            Risk flagged
          </Button>
          <Button
            disabled={isDirty || !capabilities.canMarkLimited}
            onClick={() => onApplyStatus({
              nextStatus: CLINIC_COMPLIANCE_STATUSES.LIMITED_BY_POLICY,
              reviewId: review.id,
            })}
            size="sm"
            type="button"
            variant="outline"
          >
            Limited
          </Button>
          <Button
            disabled={isDirty || !capabilities.canBlock}
            onClick={() => onApplyStatus({
              nextStatus: CLINIC_COMPLIANCE_STATUSES.BLOCKED,
              reviewId: review.id,
            })}
            size="sm"
            type="button"
            variant="destructive"
          >
            Block
          </Button>
          <Button
            disabled={isDirty || !capabilities.canApprove}
            onClick={() => onApplyStatus({
              nextStatus: CLINIC_COMPLIANCE_STATUSES.APPROVED,
              reviewId: review.id,
            })}
            size="sm"
            type="button"
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  )
}
