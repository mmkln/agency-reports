import { PERFORMANCE_SERVICE_TYPE_META } from '../../entities/performance-dashboard'
import {
  Panel,
  PanelBody,
  PanelHeader,
  ProgressBar,
} from '@/shared/ui'

import {
  formatDate,
  formatLooseValue,
  formatNumber,
} from './formatters'

export function TrendSeriesSection({ trends }) {
  if (!trends?.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Shows direction over time with prior-period context and key change annotations."
        title="Performance Trends"
      />
      <PanelBody className="grid gap-component">
        {trends.map((trend, index) => {
          const latestPoint = trend.series?.at?.(-1)

          return (
            <div className="rounded-control border border-control-border bg-block-subtle p-4" key={trend.id || `${trend.metric}-${index}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-ui text-text-primary">{trend.metric || 'Trend metric'}</h3>
                  <p className="mt-1 text-label font-normal text-text-muted">{trend.granularity ?? 'period'} trend</p>
                </div>
                <div className="text-ui text-text-secondary">
                  <span className="font-semibold text-text-primary">{formatLooseValue(latestPoint?.value)}</span>
                  {typeof trend.goal_value === 'number' ? <span> / goal {formatNumber(trend.goal_value)}</span> : null}
                </div>
              </div>
              {trend.series?.length ? <TrendBars series={trend.series} /> : null}
              {trend.annotations?.length ? (
                <div className="mt-4 grid gap-2 border-t border-separator pt-3">
                  {trend.annotations.map((annotation) => (
                    <p className="text-label font-normal text-text-secondary" key={`${annotation.date}-${annotation.label}`}>
                      <strong className="text-text-primary">{formatDate(annotation.date)}:</strong> {annotation.label}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </PanelBody>
    </Panel>
  )
}

function TrendBars({ series }) {
  const numericValues = series
    .map((point) => point.value)
    .filter((value) => typeof value === 'number')
  const maxValue = Math.max(...numericValues, 1)

  return (
    <div className="mt-4 grid gap-2">
      {series.map((point) => {
        const barValue = typeof point.value === 'number'
          ? Math.max(4, Math.round((point.value / maxValue) * 100))
          : 0

        return (
          <div className="grid gap-1.5" key={`${point.date}-${point.value}`}>
            <div className="flex items-center justify-between gap-3 text-label">
              <span className="text-text-muted">{formatDate(point.date)}</span>
              <span className="font-medium text-text-primary">{formatLooseValue(point.value)}</span>
            </div>
            <ProgressBar label={`${point.date} trend value`} showLabel={false} value={barValue} />
          </div>
        )
      })}
    </div>
  )
}

export function ServiceSectionsSection({ sections }) {
  if (!sections?.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Service-specific interpretation for clients who need a deeper channel read."
        title="Service Details"
      />
      <PanelBody className="grid gap-component">
        {sections.map((section, index) => (
          <div className="rounded-control border border-control-border bg-block-subtle p-4" key={section.id || `${section.service_type}-${index}`}>
            <h3 className="text-ui text-text-primary">
              {PERFORMANCE_SERVICE_TYPE_META[section.service_type]?.label ?? section.service_type ?? 'Service'}
            </h3>
            {section.summary ? <p className="mt-2 text-body text-text-secondary">{section.summary}</p> : null}
            {section.metrics && Object.keys(section.metrics).length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(section.metrics).map(([metricName, value]) => (
                  <div key={metricName}>
                    <p className="text-label text-text-muted">{metricName.replaceAll('_', ' ')}</p>
                    <p className="mt-1 font-semibold text-text-primary">{formatLooseValue(value)}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {section.insights?.length ? (
              <div className="mt-4 grid gap-2">
                {section.insights.map((insight) => (
                  <p className="text-body text-text-secondary" key={insight}>- {insight}</p>
                ))}
              </div>
            ) : null}
            {section.next_actions?.length ? (
              <div className="mt-4 border-t border-separator pt-3">
                <p className="text-label text-text-muted">Next actions</p>
                <div className="mt-2 grid gap-2">
                  {section.next_actions.map((action) => (
                    <p className="text-body text-text-secondary" key={action}>- {action}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

export function AppendixTablesSection({ tables }) {
  if (!tables?.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Optional drill-down detail for top performers and supporting evidence."
        title="Appendix"
      />
      <PanelBody className="grid gap-component">
        {tables.map((table, index) => (
          <div className="overflow-hidden rounded-control border border-control-border" key={table.id || `${table.title}-${index}`}>
            <div className="border-b border-separator bg-block-subtle px-4 py-3">
              <h3 className="text-ui text-text-primary">{table.title || 'Appendix table'}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-ui">
                {table.columns?.length ? (
                  <thead className="bg-surface-subtle text-label uppercase text-text-muted">
                    <tr>
                      {table.columns.map((column) => (
                        <th className="px-4 py-3 font-semibold" key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody className="divide-y divide-separator">
                  {table.rows?.length ? table.rows.map((row, rowIndex) => (
                    <tr key={`${table.id || table.title}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td className="px-4 py-3 text-text-secondary" key={`${cell}-${cellIndex}`}>{formatLooseValue(cell)}</td>
                      ))}
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-4 py-3 text-text-muted" colSpan={table.columns?.length || 1}>No rows added.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}
