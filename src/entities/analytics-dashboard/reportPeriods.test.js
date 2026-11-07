import { describe, expect, it } from 'vitest'

import { buildReportPeriods } from './reportPeriods'

describe('analytics dashboard report periods', () => {
  it('builds Monday through Sunday periods including the current week', () => {
    const periods = buildReportPeriods({
      currentDate: '2026-11-07',
      historyStart: '2026-10-20',
      periodType: 'week',
    })

    expect(periods).toEqual([
      expect.objectContaining({
        end: '2026-11-08',
        isCurrent: true,
        key: 'week:2026-11-02',
        start: '2026-11-02',
      }),
      expect.objectContaining({
        end: '2026-11-01',
        isCurrent: false,
        key: 'week:2026-10-26',
        start: '2026-10-26',
      }),
      expect.objectContaining({
        end: '2026-10-25',
        isCurrent: false,
        key: 'week:2026-10-19',
        start: '2026-10-19',
      }),
    ])
  })

  it('builds complete calendar months across a leap-year February', () => {
    const periods = buildReportPeriods({
      currentDate: '2024-03-10',
      historyStart: '2024-01-15',
      periodType: 'month_to_date',
    })

    expect(periods.map(({ end, key }) => ({ end, key }))).toEqual([
      { end: '2024-03-31', key: 'month:2024-03' },
      { end: '2024-02-29', key: 'month:2024-02' },
      { end: '2024-01-31', key: 'month:2024-01' },
    ])
  })

  it('overlays current and stale snapshots without creating report records', () => {
    const periods = buildReportPeriods({
      currentDate: '2026-11-07',
      historyStart: '2026-10-19',
      periodType: 'week',
      reports: [
        {
          calculatedAt: '2026-11-05T10:00:00Z',
          calculationStatus: 'current',
          key: 'week:2026-10-26',
          snapshotId: 'snapshot-current',
          status: 'completed',
        },
        {
          calculationStatus: 'stale',
          key: 'week:2026-10-19',
          snapshotId: 'snapshot-stale',
          status: 'completed',
        },
      ],
    })

    expect(periods).toEqual([
      expect.objectContaining({
        calculationStatus: 'not_calculated',
        isCurrent: true,
        key: 'week:2026-11-02',
      }),
      expect.objectContaining({
        calculationStatus: 'current',
        key: 'week:2026-10-26',
        snapshotId: 'snapshot-current',
      }),
      expect.objectContaining({
        calculationStatus: 'stale',
        key: 'week:2026-10-19',
        snapshotId: 'snapshot-stale',
      }),
    ])
  })
})
