import { describe, expect, it } from 'vitest'

import {
  periodToForm,
  serializeForm,
} from './performanceDashboardEditorForm'

describe('performance dashboard editor form', () => {
  it('keeps detail sections structured and serializes them back to normalized content', () => {
    const form = periodToForm({
      accountManager: '',
      agencyContact: '',
      attributionNote: '',
      clientId: '11111111-1111-4111-8111-111111111111',
      content: {
        appendix_tables: [
          {
            columns: ['Campaign', 'Spend'],
            id: 'table-a',
            rows: [['Search', '$500']],
            title: 'Top Campaigns',
          },
        ],
        service_sections: [
          {
            id: 'service-a',
            insights: ['Search quality improved.'],
            metrics: {
              qualified_leads: 24,
            },
            next_actions: ['Scale search gradually.'],
            service_type: 'paid_ads',
            summary: 'Paid ads improved.',
          },
        ],
        trends: [
          {
            annotations: [{ date: '2026-04-15', label: 'Landing page update' }],
            comparison_series: [{ date: '2026-03-01', value: 18 }],
            goal_value: 30,
            granularity: 'weekly',
            id: 'trend-a',
            metric: 'qualified_leads',
            series: [{ date: '2026-04-01', value: 24 }],
          },
        ],
      },
      dataConfidence: 'medium',
      dataMode: 'manual',
      id: '22222222-2222-4222-8222-222222222222',
      lastUpdatedAt: '2026-05-15T09:00:00.000Z',
      periodEnd: '2026-04-30',
      periodStart: '2026-04-01',
      sourceSummary: '',
      status: 'draft',
      title: 'April Performance',
    })

    expect(form.content.trends[0].series[0]).toMatchObject({
      date: '2026-04-01',
      value: 24,
    })
    expect(form.content.service_sections[0].metrics_entries[0]).toMatchObject({
      key: 'qualified_leads',
      value: 24,
    })
    expect(form.content.appendix_tables[0].rows[0].cells[0]).toMatchObject({
      value: 'Search',
    })

    form.content.trends[0].series = [
      {
        date: '2026-04-08',
        id: 'point-a',
        value: 28,
      },
    ]
    form.content.service_sections[0].metrics_entries = [
      {
        id: 'metric-a',
        key: 'qualified_leads',
        value: 28,
      },
      {
        id: 'metric-b',
        key: 'cpl',
        value: 72,
      },
    ]
    form.content.appendix_tables[0].rows = [
      {
        cells: [
          {
            id: 'cell-a',
            value: 'Meta',
          },
          {
            id: 'cell-b',
            value: '$300',
          },
        ],
        id: 'row-a',
      },
    ]

    const serialized = serializeForm(form)

    expect(serialized.content.trends[0]).toMatchObject({
      display_order: 0,
      goal_value: 30,
      series: [{ date: '2026-04-08', value: 28 }],
    })
    expect(serialized.content.service_sections[0]).toMatchObject({
      display_order: 0,
      metrics: {
        cpl: 72,
        qualified_leads: 28,
      },
    })
    expect(serialized.content.appendix_tables[0]).toMatchObject({
      display_order: 0,
      rows: [['Meta', '$300']],
    })
  })
})
