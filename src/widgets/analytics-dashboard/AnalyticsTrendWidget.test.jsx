import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AnalyticsTrendWidget } from './AnalyticsTrendWidget'

describe('AnalyticsTrendWidget', () => {
  it('renders managed explanations for the chart and each activity series', () => {
    const explanations = Object.fromEntries([
      ['activity.weekly', 'Weekly Activity', 'chart'],
      ['activity.weekly.sms', 'SMS', 'metric'],
      ['activity.weekly.email', 'Email', 'metric'],
      ['activity.weekly.call', 'Calls', 'metric'],
    ].map(([explanationKey, label, kind]) => [
      explanationKey,
      {
        definition: `${label} definition`,
        explanationKey,
        kind,
        label,
      },
    ]))

    const html = renderToStaticMarkup(
      <AnalyticsTrendWidget
        data={{
          key: 'activity.weekly',
          rows: [{ call: 1, email: 2, label: 'Mon', sms: 3 }],
          series: [
            { key: 'sms', label: 'SMS' },
            { key: 'email', label: 'Email' },
            { key: 'call', label: 'Calls' },
          ],
        }}
        explanations={explanations}
        title="Weekly Activity"
      />,
    )

    expect(html).toContain('aria-label="About Weekly Activity"')
    expect(html).toContain('aria-label="About SMS"')
    expect(html).toContain('aria-label="About Email"')
    expect(html).toContain('aria-label="About Calls"')
  })
})
