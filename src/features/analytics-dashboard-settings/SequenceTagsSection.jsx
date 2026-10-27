import { MultiSelect } from '@/shared/ui'

export function SequenceTagsSection({ onChange, tagNames, tagOptions }) {
  return (
    <section className="grid gap-item">
      <div>
        <h3 className="text-ui font-semibold text-text-primary">In Sequence</h3>
        <p className="mt-micro text-label text-text-muted">
          Count contacts that currently have any of these active-sequence tags.
        </p>
      </div>
      <MultiSelect
        emptyText="No synced GHL tags are available. Refresh source data first."
        onChange={onChange}
        options={tagOptions}
        placeholder="Choose active-sequence tags"
        value={tagNames}
      />
    </section>
  )
}
