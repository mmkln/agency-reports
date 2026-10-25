import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AnalyticsBreakdownWidget } from './AnalyticsBreakdownWidget'

describe('AnalyticsBreakdownWidget', () => {
  it('renders a donut summary and exact source distribution table', () => {
    const html = renderToStaticMarkup(
      <AnalyticsBreakdownWidget
        data={{
          rows: [
            { key: 'meta', label: 'Meta', value: 21 },
            { key: 'unattributed', label: 'Unattributed', value: 12 },
            { key: 'reactivation', label: 'Reactivation', value: 7 },
          ],
          total: 40,
        }}
        title="Leads by Source"
      />,
    )

    expect(html).toContain('Leads by Source')
    expect(html).toContain('Source')
    expect(html).toContain('Leads')
    expect(html).toContain('% of total')
    expect(html).toContain('52.5%')
    expect(html).toContain('30.0%')
    expect(html).toContain('17.5%')
    expect(html).toContain('Total')
    expect(html).toContain('100.0%')
    expect(html).not.toContain('bg-action')
  })
})
