import { describe, expect, it } from 'vitest'

import {
  applyClinicComplianceImportToDraft,
  previewClinicComplianceImport,
} from './clinicComplianceImportDraft'

const CLIENT_ID = 'client-green-dental'

function createPayload(overrides = {}) {
  return {
    client_id: CLIENT_ID,
    compliance: {
      compliance_reviews: [
        {
          open_issues: 2,
          platform: 'Google Ads',
          status: 'risk_flagged',
          summary: 'E2E compliance import summary.',
          title: 'Emergency ad claims review',
        },
      ],
    },
    ...overrides,
  }
}

describe('clinicComplianceImportDraft', () => {
  it('previews aggregate compliance imports for the current client', () => {
    const plan = previewClinicComplianceImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify(createPayload()),
    })

    expect(plan.summary).toEqual({
      complianceReviewCount: 1,
      platforms: ['Google Ads'],
      statuses: ['risk_flagged'],
    })
    expect(plan.normalizedPayload.complianceInput.complianceReviews[0]).toEqual(expect.objectContaining({
      publish_state: 'draft',
      title: 'Emergency ad claims review',
    }))
  })

  it('blocks imports for another client workspace', () => {
    expect(() => previewClinicComplianceImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify(createPayload({ client_id: 'client-other' })),
    })).toThrow('different client workspace')
  })

  it('blocks empty imports before they can be applied', () => {
    expect(() => previewClinicComplianceImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify({
        client_id: CLIENT_ID,
      }),
    })).toThrow('No clinic compliance records were found')
  })

  it('blocks wrong-section imports with a workspace-specific message', () => {
    expect(() => previewClinicComplianceImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify({
        client_id: CLIENT_ID,
        metrics: {
          patient_acquisition: [
            {
              period_end: '2026-05-31',
              period_label: 'May 2026',
              period_start: '2026-05-01',
            },
          ],
        },
      }),
    })).toThrow('This JSON contains 1 metrics records')
  })

  it('applies previewed compliance records without replacing medical approvals', () => {
    const plan = previewClinicComplianceImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify(createPayload()),
    })

    const draft = applyClinicComplianceImportToDraft({
      draft: {
        complianceReviews: [{ id: 'existing-review', title: 'Existing review' }],
        medicalApprovals: [{ id: 'existing-approval', title: 'Existing approval' }],
      },
      importPlan: plan,
    })

    expect(draft.complianceReviews).toHaveLength(2)
    expect(draft.complianceReviews[0].summary).toBe('E2E compliance import summary.')
    expect(draft.medicalApprovals).toEqual([{ id: 'existing-approval', title: 'Existing approval' }])
  })
})
