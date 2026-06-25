import { ReactivationChartPanel } from './ReactivationChartPanel'

const valueRows = [
  {
    key: 'pendingProcedureTotalFee',
    label: 'Pending fee',
  },
  {
    key: 'expectedValue',
    label: 'Expected',
  },
  {
    key: 'lifetimeValue',
    label: 'Lifetime',
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

function SummaryCard({ card, currency }) {
  if (!card) {
    return null
  }

  return (
    <div className="rounded-control bg-fill-secondary px-control py-4">
      <p className="text-label font-medium text-text-muted">{card.label}</p>
      <p className="mt-2 text-title font-semibold tabular-nums text-text-primary">
        {formatCurrency(card.value, currency)}
      </p>
    </div>
  )
}

function PatientValueRow({ currency, row }) {
  return (
    <tr className="border-t border-separator">
      <th className="px-control py-3 text-left text-label font-semibold text-text-primary" scope="row">
        <span className="block max-w-56 truncate">{row.contactName}</span>
      </th>
      <td className="px-control py-3 text-label font-medium text-text-muted">
        {row.trackLabel || (row.track ? `Track ${row.track}` : '')}
      </td>
      {valueRows.map((item) => (
        <td className="px-control py-3 text-right text-label font-semibold tabular-nums text-text-primary" key={item.key}>
          {formatCurrency(row[item.key], currency)}
        </td>
      ))}
    </tr>
  )
}

export function AcceptedTreatmentValueBreakdown({ chart }) {
  if (!chart?.available) {
    return null
  }

  const cards = chart.summary?.cards ?? []
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
      <div className="grid gap-control md:grid-cols-3">
        <SummaryCard card={getCardByKey(cards, 'expected_value')} currency={currency} />
        <SummaryCard card={getCardByKey(cards, 'pending_procedure_total_fee')} currency={currency} />
        <SummaryCard card={getCardByKey(cards, 'lifetime_value')} currency={currency} />
      </div>

      {rows.length ? (
        <div className="mt-component overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
                <th className="px-control py-2 text-left" scope="col">Patient</th>
                <th className="px-control py-2 text-left" scope="col">Track</th>
                {valueRows.map((item) => (
                  <th className="px-control py-2 text-right" key={item.key} scope="col">
                    {item.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <PatientValueRow
                  currency={currency}
                  key={row.id || `${row.contactId}:${row.opportunityId}`}
                  row={row}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </ReactivationChartPanel>
  )
}
