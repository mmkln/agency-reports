import {
  Button,
  Input,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'

import { VISIBILITY } from '../../../entities/update'
import { Icon } from '../../../shared/icons'
import { createBlankUpdate } from '../model'
import { EditorCard } from './EditorCard'

export function LatestUpdateEditor({ draft, onDeleteUpdate, onUpdateUpdates }) {
  const update = draft.updates[0] ?? createBlankUpdate(draft.projects[0]?.id)
  const charCount = update.body?.length ?? 0

  function updateField(fieldName, value) {
    const nextUpdates = draft.updates.length > 0 ? [...draft.updates] : [update]
    nextUpdates[0] = {
      ...nextUpdates[0],
      [fieldName]: value,
    }
    onUpdateUpdates(nextUpdates)
  }

  return (
    <EditorCard
      action={(
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => updateField('visibility', value)}
            value={update.visibility}
          >
            <SelectTrigger className="h-8 w-[135px] bg-block text-label">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={VISIBILITY.CLIENT_VISIBLE}>Client visible</SelectItem>
              <SelectItem value={VISIBILITY.INTERNAL}>Internal</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="text-text-quaternary hover:text-destructive"
            onClick={onDeleteUpdate}
            size="icon-sm"
            title="Delete latest update"
            type="button"
            variant="ghost"
          >
            <Icon name="close" size={14} />
          </Button>
        </div>
      )}
      iconName="messageSquare"
      title="Latest Update"
    >
      <Input
        className="mb-3"
        onChange={(event) => updateField('title', event.target.value)}
        placeholder="Weekly client update"
        value={update.title}
      />
      <Textarea
        onChange={(event) => updateField('body', event.target.value)}
        placeholder="This week we launched the first campaign structure, connected tracking, and started testing new ad angles."
        value={update.body}
      />
      <p className="mt-2 text-label font-normal text-text-quaternary">
        {charCount} characters
      </p>
      {update.visibility === VISIBILITY.INTERNAL ? (
        <p className="mt-2 rounded-control bg-warning-muted px-3 py-2 text-label font-normal text-warning-foreground">
          Internal update: this text is saved for the agency only and will not appear on the client portal.
        </p>
      ) : null}
    </EditorCard>
  )
}
