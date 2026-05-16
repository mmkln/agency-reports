import { useState } from 'react'

import {
  Badge,
  Button,
  Input,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'
import { EditorCard } from './EditorCard'

export function CurrentFocusEditor({ draft, onChange }) {
  const [newFocus, setNewFocus] = useState('')
  const activeItems = draft.currentFocus.filter((item) => item.trim())
  const canAdd = activeItems.length < 3 && newFocus.trim()

  function addFocus() {
    if (!canAdd) {
      return
    }

    onChange([...activeItems, newFocus.trim()])
    setNewFocus('')
  }

  return (
    <EditorCard
      action={<Badge className="bg-control text-text-secondary" variant="outline">{activeItems.length}/3 items</Badge>}
      iconName="target"
      title="Current Focus"
    >
      <div className="grid gap-2">
        {draft.currentFocus.map((focusItem, index) => (
          <div className="group flex items-center gap-2 rounded-control bg-surface-subtle px-3 py-2" key={index}>
            <Icon className="text-text-quaternary" name="grid" size={14} />
            <Input
              className="h-8 min-w-0 flex-1 border-transparent bg-transparent px-0 shadow-none focus-visible:ring-0"
              onChange={(event) => onChange(draft.currentFocus.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
              placeholder="e.g. Meta Ads campaign optimization"
              value={focusItem}
            />
            <button
              aria-label={`Remove focus item: ${focusItem || 'Untitled focus item'}`}
              className="flex h-7 w-7 shrink-0 items-center justify-center text-text-quaternary opacity-70 transition hover:text-destructive hover:opacity-100 focus-visible:ring-2 focus-visible:ring-destructive/20 focus-visible:outline-none"
              onClick={() => onChange(draft.currentFocus.filter((_, itemIndex) => itemIndex !== index))}
              type="button"
            >
              <Icon name="close" size={13} />
            </button>
          </div>
        ))}
        {activeItems.length < 3 ? (
          <div className="flex gap-2">
            <Input
              onChange={(event) => setNewFocus(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addFocus()
                }
              }}
              placeholder="e.g. Meta Ads campaign optimization"
              value={newFocus}
            />
            <Button disabled={!canAdd} onClick={addFocus} type="button">Add</Button>
          </div>
        ) : null}
      </div>
    </EditorCard>
  )
}
