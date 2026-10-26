import {
  Panel,
  PanelBody,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

import { AnalyticsSegmentedBar } from './AnalyticsSegmentedBar'
import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'
import { AnalyticsSeriesLegend } from './AnalyticsSeriesLegend'
import { AnalyticsWidgetHeader } from './AnalyticsWidgetHeader'

function formatPercent(value) {
  return `${Math.round(Number(value) || 0)}%`
}

function ColumnHeading({
  children,
  explanationEditor,
  explanationKey,
  explanations,
}) {
  return (
    <span className="inline-flex items-center justify-end gap-micro">
      {children}
      <AnalyticsExplanationPopover
        explanationEditor={explanationEditor}
        explanationKey={explanationKey}
        explanations={explanations}
        triggerSize="xs"
      />
    </span>
  )
}

function SeriesTotals({ series, totals }) {
  return (
    <div className="flex min-w-max items-center gap-item">
      {series.map((item) => (
        <span className="w-14 text-left tabular-nums text-text-primary" key={item.key}>
          {Number(totals[item.key] ?? 0).toLocaleString()}
        </span>
      ))}
    </div>
  )
}

export function AnalyticsSegmentedTableWidget({
  data,
  explanationEditor,
  explanations,
  title,
}) {
  const rows = data?.rows ?? []
  const series = data?.series ?? []
  const total = Number(data?.total ?? 0)
  const maxTotal = Math.max(...rows.map((row) => Number(row.total ?? 0)), 1)

  return (
    <Panel>
      <AnalyticsWidgetHeader
        explanationEditor={explanationEditor}
        explanationKey={data?.explanation_key ?? data?.key}
        explanations={explanations}
        title={title}
      />
      <PanelBody className="pt-item">
        <div className="overflow-hidden rounded-block border border-separator">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">{data?.dimension_label ?? 'Channel'}</TableHead>
                <TableHead>
                  <AnalyticsSeriesLegend
                    explanationEditor={explanationEditor}
                    explanationKey={data?.key}
                    explanations={explanations}
                    series={series}
                  />
                </TableHead>
                <TableHead className="w-20 text-right">
                  <ColumnHeading
                    explanationEditor={explanationEditor}
                    explanationKey={`${data?.key}.total`}
                    explanations={explanations}
                  >
                    Total
                  </ColumnHeading>
                </TableHead>
                <TableHead className="w-24 text-right">
                  <ColumnHeading
                    explanationEditor={explanationEditor}
                    explanationKey={`${data?.key}.percentage`}
                    explanations={explanations}
                  >
                    % of total
                  </ColumnHeading>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-semibold text-text-primary">{row.label}</TableCell>
                  <TableCell>
                    <AnalyticsSegmentedBar
                      label={`${row.label}: ${row.total} total`}
                      maxTotal={maxTotal}
                      series={series}
                      total={Number(row.total ?? 0)}
                      values={row.values ?? {}}
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-text-primary">
                    {Number(row.total ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-text-muted">
                    {formatPercent(row.percentage)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold text-text-primary">Total</TableCell>
                <TableCell><SeriesTotals series={series} totals={data?.totals ?? {}} /></TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-text-primary">
                  {total.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-text-primary">
                  {formatPercent(total ? 100 : 0)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {data?.note ? <p className="mt-item text-label text-text-muted">{data.note}</p> : null}
      </PanelBody>
    </Panel>
  )
}
