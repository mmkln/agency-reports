import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ReactivationChartPanel } from './ReactivationChartPanel'

describe('ReactivationChartPanel', () => {
  it('uses the explanation display name with the chart title as fallback', () => {
    const customizedHtml = renderToStaticMarkup(
      <ReactivationChartPanel
        explanation={{ definition: 'Weekly activity.', isLabelCustomized: true, label: 'Outreach by Week' }}
        explanationKey="weekly-activity"
        title="Weekly Activity"
      >
        <p>Chart</p>
      </ReactivationChartPanel>,
    )
    const fallbackHtml = renderToStaticMarkup(
      <ReactivationChartPanel title="Weekly Activity">
        <p>Chart</p>
      </ReactivationChartPanel>,
    )

    expect(customizedHtml).toContain('Outreach by Week')
    expect(customizedHtml).not.toContain('>Weekly Activity<')
    expect(fallbackHtml).toContain('Weekly Activity')
  })
})
