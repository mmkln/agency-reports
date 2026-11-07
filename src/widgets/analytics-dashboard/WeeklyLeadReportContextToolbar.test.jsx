import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { WeeklyLeadReportContextToolbar } from './WeeklyLeadReportContextToolbar'

describe('WeeklyLeadReportContextToolbar', () => {
  it('uses the same title, metadata, and action hierarchy as Growth Review', () => {
    const html = renderToStaticMarkup(
      <WeeklyLeadReportContextToolbar
        calculatedAt="2026-10-25T22:33:00Z"
        isRefreshing={false}
        onRefresh={() => {}}
        periodSelector={<button type="button">Oct 19 – Oct 25</button>}
        refresh={null}
        refreshError=""
        settingsAction={<button type="button">Settings</button>}
        title="Weekly Lead Report"
      />,
    )

    expect(html.indexOf('Weekly Lead Report')).toBeLessThan(html.indexOf('Oct 19 – Oct 25'))
    expect(html).toContain('Data updated')
    expect(html.indexOf('Settings')).toBeLessThan(html.indexOf('Refresh'))
    expect(html).toContain('Refresh')
    expect(html).not.toContain('border-separator')
  })
})
