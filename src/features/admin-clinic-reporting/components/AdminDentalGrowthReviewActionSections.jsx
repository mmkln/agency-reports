import {
  Button,
  FormField,
  Textarea,
} from '@/shared/ui'

function FieldLabel({ children }) {
  return <span className="text-label text-text-muted">{children}</span>
}

function SectionHeader({ helper, title }) {
  return (
    <div className="grid gap-micro">
      <h3 className="text-ui font-semibold text-text-primary">{title}</h3>
      {helper ? <p className="text-label font-normal text-text-muted">{helper}</p> : null}
    </div>
  )
}

function TextAreaField({ label, onChange, value }) {
  return (
    <label className="grid gap-item">
      <FieldLabel>{label}</FieldLabel>
      <Textarea className="resize-none" onChange={(event) => onChange(event.target.value)} value={value ?? ''} />
    </label>
  )
}

function createBlankItem(type) {
  return {
    id: `${type}-${Date.now()}`,
    owner: '',
    status: type === 'experiment' ? 'planned' : '',
    title: '',
  }
}

function EditableActionList({
  bodyField = 'body',
  bodyLabel = 'Notes',
  collection,
  draft,
  itemType,
  title,
  updateDraft,
}) {
  const items = draft.content[collection] ?? []
  const canAdd = items.length < 3

  function updateItem(index, key, value) {
    updateDraft((next) => {
      next.content[collection][index][key] = value
    })
  }

  function addItem() {
    updateDraft((next) => {
      next.content[collection] = [...(next.content[collection] ?? []), createBlankItem(itemType)]
    })
  }

  return (
    <div className="grid gap-item rounded-control bg-block p-control">
      <div className="flex items-center justify-between gap-control">
        <p className="text-ui font-semibold text-text-primary">{title}</p>
        {canAdd ? (
          <Button onClick={addItem} size="sm" type="button" variant="outline">
            Add
          </Button>
        ) : null}
      </div>
      {items.length ? items.map((item, index) => (
        <div className="grid gap-item rounded-control bg-block-subtle p-control" key={item.id || index}>
          <FormField label="Title" onValueChange={(value) => updateItem(index, 'title', value)} value={item.title ?? item.name ?? item.previous_commitment} />
          <TextAreaField label={bodyLabel} onChange={(value) => updateItem(index, bodyField, value)} value={item[bodyField]} />
          <div className="grid gap-item md:grid-cols-2">
            <FormField label="Owner" onValueChange={(value) => updateItem(index, 'owner', value)} value={item.owner} />
            <FormField label="Status" onValueChange={(value) => updateItem(index, 'status', value)} value={item.status} />
          </div>
        </div>
      )) : (
        <p className="text-label font-normal text-text-muted">No items yet.</p>
      )}
    </div>
  )
}

export function ActionNarrativeFields({ draft, updateDraft }) {
  return (
    <section className="grid gap-control rounded-control bg-block-subtle p-control">
      <SectionHeader
        helper="These are editorial action notes. They do not change calculated metrics."
        title="Watching / shipped / experiments"
      />
      <div className="grid gap-control lg:grid-cols-3">
        <EditableActionList
          bodyField="why_watch"
          bodyLabel="Why watch"
          collection="watching"
          draft={draft}
          itemType="watching"
          title="Watching"
          updateDraft={updateDraft}
        />
        <EditableActionList
          bodyField="result"
          bodyLabel="Result"
          collection="closed_loops"
          draft={draft}
          itemType="shipped"
          title="Recently shipped"
          updateDraft={updateDraft}
        />
        <EditableActionList
          bodyField="hypothesis"
          bodyLabel="Hypothesis"
          collection="experiments"
          draft={draft}
          itemType="experiment"
          title="Experiments"
          updateDraft={updateDraft}
        />
      </div>
    </section>
  )
}
