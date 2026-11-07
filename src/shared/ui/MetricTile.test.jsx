import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MetricTile } from './MetricTile'

describe('MetricTile', () => {
  it('keeps the existing report tile API working', () => {
    const html = renderToStaticMarkup(
      <MetricTile
        helper="Compared with target"
        statusLabel="On track"
        title="Revenue"
        value="$12,000"
      />,
    )

    expect(html).toContain('Revenue')
    expect(html).toContain('$12,000')
    expect(html).toContain('Compared with target')
    expect(html).toContain('On track')
    expect(html).toContain('min-h-52')
  })

  it('renders the featured dashboard hierarchy with inline context', () => {
    const html = renderToStaticMarkup(
      <MetricTile
        action={<span>Explanation</span>}
        helper="9.7% of cohort"
        iconName="calendar"
        label="Booked appointments"
        tone="positive"
        value="63"
        variant="featured"
      />,
    )

    expect(html).toContain('Booked appointments')
    expect(html).toContain('63')
    expect(html).toContain('9.7% of cohort')
    expect(html).toContain('text-[40px]')
    expect(html).toContain('text-success')
  })

  it('places an unlabeled activity explanation beside its caption', () => {
    const html = renderToStaticMarkup(
      <MetricTile
        action={<span>Explanation</span>}
        helper="SMS sent"
        iconName="messageSquare"
        value="1,063"
        variant="activity"
      />,
    )

    expect(html.indexOf('SMS sent')).toBeLessThan(html.indexOf('Explanation'))
    expect(html).toContain('size-8')
    expect(html).toContain('text-[22px]')
  })
})
