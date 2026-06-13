import {
  formatDetailDate,
} from '../model/clientDetailPresentation'

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-control">
      <dt className="text-label uppercase text-text-muted">{label}</dt>
      <dd className="m-0 flex justify-end text-right text-ui font-medium text-text-primary">{value}</dd>
    </div>
  )
}

export function ClientDetailsPanel({ client }) {
  return (
    <aside className="grid gap-component rounded-block bg-block p-card lg:sticky lg:top-card">
      <h2 className="m-0 text-ui font-semibold text-text-primary">Details</h2>
      <dl className="m-0 grid gap-item sm:grid-cols-2 lg:grid-cols-1">
        <DetailRow label="Created" value={formatDetailDate(client.createdAt)} />
        <DetailRow label="Updated" value={formatDetailDate(client.updatedAt)} />
      </dl>
    </aside>
  )
}
