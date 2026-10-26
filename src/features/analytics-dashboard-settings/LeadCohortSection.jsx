import { MultiSelect } from '@/shared/ui'

export function LeadCohortSection({ onChange, pipelineIds, pipelineOptions }) {
  return (
    <section className="grid gap-item">
      <div>
        <h3 className="text-ui font-semibold text-text-primary">Lead cohort</h3>
        <p className="mt-micro text-label text-text-muted">
          Opportunities created in these pipelines enter the report.
        </p>
      </div>
      <MultiSelect
        emptyText="No synced pipelines are available."
        onChange={onChange}
        options={pipelineOptions.map((pipeline) => ({
          label: pipeline.label,
          value: pipeline.id,
        }))}
        placeholder="Choose lead pipelines"
        value={pipelineIds}
      />
    </section>
  )
}
