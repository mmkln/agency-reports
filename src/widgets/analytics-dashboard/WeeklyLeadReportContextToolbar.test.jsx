import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { WeeklyLeadReportContextToolbar } from './WeeklyLeadReportContextToolbar'

describe('WeeklyLeadReportContextToolbar', () => {
  it('uses the same title, metadata, and action hierarchy as Growth Review', () => {
    const html = renderToStaticMarkup(
      <WeeklyLeadReportContextToolbar
        calculatedAt="2026-10-25T22:33:00Z"
        isRefreshing={false}
        onPeriodEndChange={() => {}}
        onPeriodTypeChange={() => {}}
        onRefresh={() => {}}
        period={{ end: '2026-10-25', start: '2026-10-19' }}
        periodEnd="2026-10-25"
        periodType="week"
        refresh={null}
        refreshError=""
        title="Weekly Lead Report"
      />,
    )

    expect(html.indexOf('Weekly Lead Report')).toBeLessThan(html.indexOf('Oct 19 – Oct 25'))
    expect(html).toContain('Data updated')
    expect(html).toContain('Refresh')
    expect(html).not.toContain('border-separator')
  })
})
