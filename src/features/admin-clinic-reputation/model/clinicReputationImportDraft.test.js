import { describe, expect, it } from 'vitest'

import {
  applyClinicReputationImportToDraft,
  previewClinicReputationImport,
} from './clinicReputationImportDraft'

const CLIENT_ID = 'client-green-dental'

function createPayload(overrides = {}) {
  return {
    client_id: CLIENT_ID,
    reputation: {
      reputation_snapshots: [
        {
          google_rating: 4.9,
          period_end: '2026-06-30',
          period_label: 'June 2026',
          period_start: '2026-06-01',
          review_count: 360,
          reviews_gained: 18,
          summary: 'E2E reputation import summary.',
        },
      ],
    },
    ...overrides,
  }
}

describe('clinicReputationImportDraft', () => {
  it('previews aggregate reputation imports for the current client', () => {
    const plan = previewClinicReputationImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify(createPayload()),
    })

    expect(plan.summary).toEqual({
      periods: ['June 2026'],
      reputationSnapshotCount: 1,
    })
    expect(plan.normalizedPayload.reputationInput.reputationSnapshots[0]).toEqual(expect.objectContaining({
      google_rating: 4.9,
      publish_state: 'draft',
    }))
  })

  it('blocks imports for another client workspace', () => {
    expect(() => previewClinicReputationImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify(createPayload({ client_id: 'client-other' })),
    })).toThrow('different client workspace')
  })

  it('applies previewed reputation records to the unsaved draft', () => {
    const plan = previewClinicReputationImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify(createPayload()),
    })

    const draft = applyClinicReputationImportToDraft({
      draft: {
        reputationSnapshots: [{ id: 'existing-reputation', period_label: 'May 2026' }],
      },
      importPlan: plan,
    })

    expect(draft.reputationSnapshots).toHaveLength(2)
    expect(draft.reputationSnapshots[0].summary).toBe('E2E reputation import summary.')
  })
})
