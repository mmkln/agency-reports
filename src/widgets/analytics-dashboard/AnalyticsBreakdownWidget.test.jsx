import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AnalyticsBreakdownWidget } from './AnalyticsBreakdownWidget'

describe('AnalyticsBreakdownWidget', () => {
  it('renders lead volume, patient mix, and source distribution', () => {
    const html = renderToStaticMarkup(
      <AnalyticsBreakdownWidget
        data={{
          key: 'leads.volume_by_source',
          summary: {
            comparison: {
              delta: -1,
              delta_percent: -5.6,
              label: 'vs prior week',
              prior_value: 18,
            },
            new_patient: 16,
            returning_patient: 1,
            value: 17,
          },
          rows: [
            {
              details: [{ label: '$199 Offer', value: 7 }, { label: 'Veteran Offer 2', value: 2 }],
              key: 'meta',
              label: 'Meta Ads',
              percentage: 52.9,
              tone: 'accent',
              value: 9,
            },
            {
              details: [],
              key: 'website',
              label: 'Website',
              percentage: 11.8,
              tone: 'neutral',
              value: 2,
            },
          ],
          total: 17,
        }}
        explanations={{
          'leads.volume_by_source': {
            definition: 'Lead volume by source.',
            explanationKey: 'leads.volume_by_source',
            kind: 'chart',
            label: 'Lead Volume and Sources',
          },
          'leads.volume_by_source.new_patient': {
            definition: 'Leads without a patient ID.',
            explanationKey: 'leads.volume_by_source.new_patient',
            kind: 'metric',
            label: 'New patients',
          },
          'leads.volume_by_source.returning_patient': {
            definition: 'Leads with a patient ID.',
            explanationKey: 'leads.volume_by_source.returning_patient',
            kind: 'metric',
            label: 'Returning patients',
          },
        }}
        title="Lead Volume and Sources"
      />,
    )

    expect(html).toContain('Lead Volume and Sources')
    expect(html).toContain('Last week')
    expect(html).toContain('17')
    expect(html).toContain('-1 (-5.6%)')
    expect(html).toContain('vs prior week (18)')
    expect(html).toContain('16')
    expect(html).toContain('new patients')
    expect(html).toContain('Meta Ads')
    expect(html).toContain('$199 Offer · Veteran Offer 2')
    expect(html).toContain('53%')
    expect(html).toContain('border-block')
    expect(html).toContain('aria-label="About Lead Volume and Sources"')
    expect(html).toContain('aria-label="About New patients"')
    expect(html).toContain('aria-label="About Returning patients"')
  })
})
