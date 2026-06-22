import {
  Button,
  Input,
} from '@/shared/ui'

import {
  InlineEmptyState,
  WorkspaceCard,
} from '../../../admin-client-workspace/components/WorkspaceCard'
import { createServiceTextItem } from '../../model'

export function AgencyWorkSection({
  form,
  updateContent,
}) {
  function addItem(groupName) {
    updateContent('agency_work', (currentWork) => ({
      ...currentWork,
      [groupName]: [...currentWork[groupName], createServiceTextItem()],
    }))
  }

  function removeItem(groupName, itemId) {
    updateContent('agency_work', (currentWork) => ({
      ...currentWork,
      [groupName]: currentWork[groupName].filter((item) => item.id !== itemId),
    }))
  }

  function updateItem(groupName, itemId, value) {
    updateContent('agency_work', (currentWork) => ({
      ...currentWork,
      [groupName]: currentWork[groupName].map((item) => (
        item.id === itemId ? { ...item, text: value } : item
      )),
    }))
  }

  return (
    <WorkspaceCard
      description="Show the client what work was completed, what is active now, and what is planned next."
      iconName="checkCircle2"
      title="What We Did"
    >
      <div className="grid gap-3">
        <TextListEditor
          addLabel="Add Completed"
          emptyText="Add completed work, optimizations, tests, assets, or deliverables."
          emptyTitle="No completed work yet"
          items={form.content.agency_work.completed}
          onAdd={() => addItem('completed')}
          onRemove={(itemId) => removeItem('completed', itemId)}
          onUpdate={(itemId, value) => updateItem('completed', itemId, value)}
          placeholder="Launched Meta retargeting campaign"
          title="Completed this period"
        />
        <TextListEditor
          addLabel="Add Active"
          emptyText="Add workstreams currently in progress."
          emptyTitle="No active work yet"
          items={form.content.agency_work.active}
          onAdd={() => addItem('active')}
          onRemove={(itemId) => removeItem('active', itemId)}
          onUpdate={(itemId, value) => updateItem('active', itemId, value)}
          placeholder="Optimizing landing page conversion path"
          title="Active now"
        />
        <TextListEditor
          addLabel="Add Planned"
          emptyText="Add near-term planned team work."
          emptyTitle="No planned work yet"
          items={form.content.agency_work.next}
          onAdd={() => addItem('next')}
          onRemove={(itemId) => removeItem('next', itemId)}
          onUpdate={(itemId, value) => updateItem('next', itemId, value)}
          placeholder="Prepare next creative testing batch"
          title="Planned next"
        />
      </div>
    </WorkspaceCard>
  )
}

function TextListEditor({
  addLabel,
  emptyText,
  emptyTitle,
  items,
  onAdd,
  onRemove,
  onUpdate,
  placeholder,
  title,
}) {
  return (
    <div className="rounded-control border border-control-border bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-label text-text-secondary">{title}</p>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          {addLabel}
        </Button>
      </div>
      <div className="mt-3 grid gap-2">
        {items.length ? items.map((item) => (
          <div className="grid gap-2 md:grid-cols-[1fr_auto]" key={item.id}>
            <Input
              aria-label={title}
              onChange={(event) => onUpdate(item.id, event.target.value)}
              placeholder={placeholder}
              value={item.text ?? ''}
            />
            <Button onClick={() => onRemove(item.id)} size="sm" type="button" variant="ghost">
              Remove
            </Button>
          </div>
        )) : (
          <InlineEmptyState iconName="messageSquare" title={emptyTitle}>
            {emptyText}
          </InlineEmptyState>
        )}
      </div>
    </div>
  )
}
