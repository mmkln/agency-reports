import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

import { ReactivationChartPanel } from './ReactivationChartPanel'

const summaryCards = [
  {
    key: 'total_expected_value',
    prominence: 'primary',
  },
  {
    key: 'open_value',
  },
  {
    key: 'paid_value',
  },
]

const tableColumns = [
  {
    getTotal: ({ rawTotals }) => rawTotals.first_time_value,
    getValue: (row) => row.rawValues?.first_time_value,
    key: 'firstTimeValue',
    label: 'First time value',
  },
  {
    getTotal: ({ rawTotals }) => rawTotals.pending_procedure_total_fee,
    getValue: (row) => row.rawValues?.pending_procedure_total_fee,
    key: 'pending',
    label: 'Pending Procedure Value',
  },
  {
    getTotal: ({ rawTotals }) => rawTotals.expected_value,
    getValue: (row) => row.rawValues?.expected_value,
    key: 'expectedValue',
    label: 'Total Expected Value',
    priority: 'primary',
  },
  {
    getTotal: ({ cards }) => getCardByKey(cards, 'paid_value')?.value,
    getValue: (row) => row.paidValue,
    key: 'paid',
    label: 'Paid',
    priority: 'primary',
  },
  {
    getTotal: ({ rawTotals }) => rawTotals.lifetime_value,
    getValue: (row) => row.rawValues?.lifetime_value,
    key: 'lifetimeValue',
    label: 'Lifetime value',
  },
]

function formatCurrency(value, currency = 'USD') {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return '$0'
  }

  return new Intl.NumberFormat('en-US', {
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    style: 'currency',
  }).format(amount)
}

function getCardByKey(cards, key) {
  return cards.find((card) => card.key === key) ?? null
}

function getCurrencyToneClass(value, priority = 'secondary') {
  const amount = Number(value)

  if (Number.isFinite(amount) && amount < 0) {
    return 'font-semibold text-destructive'
  }

  return priority === 'primary'
    ? 'font-semibold text-text-primary'
    : 'font-medium text-text-secondary'
}

function FinancialSummary({ cards, currency }) {
  const resolvedCards = summaryCards
    .map((item) => ({
      ...item,
      card: getCardByKey(cards, item.key),
    }))
    .filter((item) => item.card)

  return (
    <div className="overflow-hidden rounded-control">
      <div className="grid divide-y divide-separator md:grid-cols-3 md:divide-x md:divide-y-0">
        {resolvedCards.map((item) => (
          <div className="px-card py-component" key={item.key}>
            <p className="text-label font-medium text-text-muted">{item.card.label}</p>
            <p className={`mt-item font-semibold tabular-nums text-text-primary ${
              item.prominence === 'primary' ? 'text-title' : 'text-heading'
            }`}
            >
              {formatCurrency(item.card.value, currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PatientValueRow({ currency, row }) {
  return (
    <TableRow>
      <TableCell className="font-semibold text-text-primary">
        <span className="block max-w-56 truncate">{row.contactName}</span>
      </TableCell>
      <TableCell className="font-medium text-text-muted">
        {row.trackLabel || (row.track ? `Track ${row.track}` : '')}
      </TableCell>
      {tableColumns.map((column) => (
        <TableCell
          className={`text-right tabular-nums ${getCurrencyToneClass(column.getValue(row), column.priority)}`}
          key={column.key}
        >
          {formatCurrency(column.getValue(row), currency)}
        </TableCell>
      ))}
    </TableRow>
  )
}

function PatientsValueTable({ currency, rows, cards, rawTotals }) {
  return (
    <div className="mt-component overflow-hidden rounded-control border border-separator">
      <Table className="min-w-[1040px]">
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Track</TableHead>
            {tableColumns.map((column) => (
              <TableHead className="text-right" key={column.key}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <PatientValueRow
              currency={currency}
              key={row.id || `${row.contactId}:${row.opportunityId}`}
              row={row}
            />
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-semibold text-text-primary">Total</TableCell>
            <TableCell className="font-medium text-text-muted">{rows.length} patients</TableCell>
            {tableColumns.map((column) => (
              <TableCell
                className={`text-right tabular-nums ${getCurrencyToneClass(
                  column.getTotal({ cards, rawTotals }),
                  column.priority,
                )}`}
                key={column.key}
              >
                {formatCurrency(column.getTotal({ cards, rawTotals }), currency)}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

export function AcceptedTreatmentValueBreakdown({ chart }) {
  if (!chart?.available) {
    return null
  }

  const cards = chart.summary?.cards ?? []
  const rawTotals = chart.summary?.rawTotals ?? {}
  const rows = chart.summary?.rows ?? []
  const currency = chart.currency || 'USD'

  if (!cards.length && !rows.length) {
    return null
  }

  return (
    <ReactivationChartPanel
      subtitle="Paid revenue, open balance, and projected value for accepted treatments."
      title="Accepted Treatment Value Breakdown"
    >
      <FinancialSummary cards={cards} currency={currency} />

      {rows.length ? (
        <PatientsValueTable cards={cards} currency={currency} rawTotals={rawTotals} rows={rows} />
      ) : null}
    </ReactivationChartPanel>
  )
}
