import { describe, expect, it } from 'vitest'

import {
  CLINIC_REPORTING_FRESHNESS_STATUSES,
  normalizeClinicReportingPeriod,
} from './model'

describe('clinic reporting model', () => {
  it('normalizes source trust freshness status from payloads', () => {
    const period = normalizeClinicReportingPeriod({
      source_trust: [
        {
          freshness_status: CLINIC_REPORTING_FRESHNESS_STATUSES.STALE,
          last_updated_at: '2026-05-18T08:00:00.000Z',
          name: 'GHL',
        },
      ],
    })

    expect(period.source_trust[0]).toMatchObject({
      freshness_status: CLINIC_REPORTING_FRESHNESS_STATUSES.STALE,
      last_updated_at: '2026-05-18T08:00:00.000Z',
      name: 'GHL',
    })
  })

  it('defaults freshness status to current when a source timestamp exists and missing otherwise', () => {
    const period = normalizeClinicReportingPeriod({
      source_trust: [
        { last_updated_at: '2026-05-20T08:00:00.000Z', name: 'GHL' },
        { name: 'Manual note' },
      ],
    })

    expect(period.source_trust.map((source) => source.freshness_status)).toEqual([
      CLINIC_REPORTING_FRESHNESS_STATUSES.CURRENT,
      CLINIC_REPORTING_FRESHNESS_STATUSES.MISSING,
    ])
  })
})
