const ACTION_TONE = Object.freeze({
  conflict: 'bg-destructive/10 text-destructive',
  create: 'bg-success-muted text-success-foreground',
  skip: 'bg-control text-text-muted',
  update: 'bg-action-muted text-action',
})

function WarningList({ warnings }) {
  if (!warnings?.length) {
    return null
  }

  return (
    <div className="rounded-control border border-warning/25 bg-warning/10 px-3 py-2 text-ui text-warning-foreground">
      <p className="font-semibold">Preview warnings</p>
      <ul className="mt-2 grid gap-1 text-label font-normal">
        {warnings.map((warning, index) => (
          <li key={`${warning.message}-${index}`}>
            {warning.line ? <span className="font-mono">Line {warning.line}</span> : 'Import'}: {warning.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PlanCount({ count, label }) {
  return (
    <div className="rounded-control bg-control px-3 py-2">
      <dt className="text-label text-text-muted">{label}</dt>
      <dd className="mt-1 text-heading text-text-primary">{count}</dd>
    </div>
  )
}

function ImportPlanPreview({ plan }) {
  if (!plan) {
    return (
      <div className="rounded-control bg-control px-3 py-3 text-ui text-text-secondary">
        Generate a preview before creating tasks.
      </div>
    )
  }

  return (
    <section className="grid gap-component rounded-block bg-block p-card">
      <div>
        <h3 className="text-ui text-text-primary">Import preview</h3>
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <PlanCount count={plan.counts.create} label="Create" />
          <PlanCount count={plan.counts.update} label="Update" />
          <PlanCount count={plan.counts.skip} label="Skip" />
          <PlanCount count={plan.counts.conflict} label="Conflict" />
        </dl>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-control bg-surface-subtle">
        {plan.items.map((item, index) => (
          <div className="flex items-start gap-3 border-t border-separator px-3 py-2 first:border-t-0" key={`${item.type}-${item.label}-${index}`}>
            <span className={`mt-0.5 inline-flex h-control-mini min-w-16 items-center justify-center rounded-full px-2 text-label uppercase ${ACTION_TONE[item.action]}`}>
              {item.action}
            </span>
            <div className="min-w-0">
              <p className="text-ui text-text-primary">{item.label}</p>
              <p className="mt-1 text-label font-normal text-text-muted">
                {item.sourceColumn ? `${item.sourceColumn}: ` : null}{item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function TaskMarkdownImportPreview({ importError, importPlan }) {
  return (
    <div className="grid content-start gap-component">
      {importError ? (
        <div className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-ui text-destructive">
          {importError}
        </div>
      ) : null}
      <WarningList warnings={importPlan?.warnings} />
      <ImportPlanPreview plan={importPlan} />
    </div>
  )
}
