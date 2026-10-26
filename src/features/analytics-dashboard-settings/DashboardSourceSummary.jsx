export function DashboardSourceSummary({ sourceConnection }) {
  if (!sourceConnection) return null

  return (
    <section className="grid gap-item">
      <div>
        <h3 className="text-ui font-semibold text-text-primary">Data source</h3>
        <p className="mt-micro text-label text-text-muted">
          The report remains attached to this source connection.
        </p>
      </div>
      <div className="flex items-center justify-between gap-item rounded-control bg-block-subtle px-component py-item">
        <div className="min-w-0">
          <p className="text-ui font-medium text-text-primary">GoHighLevel</p>
          <p className="truncate text-label text-text-muted">
            Location {sourceConnection.externalAccountId || sourceConnection.id}
          </p>
        </div>
        <span className="text-label capitalize text-text-secondary">{sourceConnection.status}</span>
      </div>
    </section>
  )
}
