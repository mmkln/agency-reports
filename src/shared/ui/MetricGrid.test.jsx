import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MetricGrid } from './MetricGrid'

function getClasses(props) {
  const html = renderToStaticMarkup(<MetricGrid {...props}>Metric</MetricGrid>)
  return html.match(/class="([^"]*)"/)[1].split(' ')
}

describe('MetricGrid', () => {
  it.each([
    ['default', 'gap-6', 'lg:grid-cols-4'],
    ['comfortable', 'gap-component', 'xl:grid-cols-4'],
    ['compact', 'gap-control', 'xl:grid-cols-4'],
    ['unknown', 'gap-6', 'lg:grid-cols-4'],
  ])('preserves the %s variant when columns are omitted', (variant, gap, desktopColumns) => {
    expect(getClasses({ variant })).toEqual(['grid', 'grid-cols-1', gap, 'md:grid-cols-2', desktopColumns])
  })

  it.each([
    [1, ['grid-cols-1']],
    [2, ['grid-cols-1', 'md:grid-cols-2']],
    [3, ['grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-3']],
    [4, ['grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-4']],
  ])('uses %i columns without retaining conflicting defaults', (columns, expectedColumns) => {
    const classes = getClasses({ columns, variant: 'comfortable' })

    expect(classes.filter((name) => name.includes('grid-cols-'))).toEqual(expectedColumns)
    expect(classes).toContain('gap-component')
  })

  it('preserves caller class overrides', () => {
    const classes = getClasses({
      className: 'gap-control xl:grid-cols-3',
      columns: 4,
      variant: 'comfortable',
    })

    expect(classes).toContain('gap-control')
    expect(classes).toContain('xl:grid-cols-3')
    expect(classes).not.toContain('gap-component')
    expect(classes).not.toContain('xl:grid-cols-4')
  })

  it('preserves inspector IDs and child content', () => {
    const html = renderToStaticMarkup(<MetricGrid id="metric-grid-custom">Metric</MetricGrid>)
    const generated = renderToStaticMarkup(<MetricGrid>Metric</MetricGrid>)

    expect(html).toContain('id="metric-grid-custom"')
    expect(html).toContain('>Metric</section>')
    expect(generated).toContain('id="MetricGrid-')
  })
})
