import { useState } from 'react'

import {
  Button,
  Input,
  Label,
  RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

import { MappingDisclosure } from './MappingDisclosure'
import {
  canonicalizeMapping,
  createEmptyMapping,
  getMappingsPresentation,
} from './mappingRuleModel'
import { MappingRulesEditor } from './MappingRulesEditor'

function cloneTrack(track) {
  return {
    ...track,
    touchTrackValue: track.touchTrackValue ?? '',
    signals: track.signals.length
      ? track.signals.map((signal) => ({
        ...signal,
        expectedValues: [...signal.expectedValues],
      }))
      : [createEmptyMapping()],
  }
}

export function TrackMappingRow({
  customFields,
  error,
  errors = {},
  isOpen,
  matchCount,
  onCommit,
  onDelete,
  onOpenChange,
  tags,
  track,
  touchTrackOptions = [],
}) {
  const [draft, setDraft] = useState(() => cloneTrack(track))
  const presentation = getMappingsPresentation(track.signals, { customFields, tags })

  function handleOpenChange(open) {
    if (open) {
      setDraft(cloneTrack(track))
    }
    onOpenChange(open)
  }

  function cancelChanges() {
    setDraft(cloneTrack(track))
    onOpenChange(false)
  }

  function applyChanges() {
    onCommit({
      ...draft,
      label: draft.label.trim(),
      signals: draft.signals.map(canonicalizeMapping),
    })
    onOpenChange(false)
  }

  return (
    <MappingDisclosure
      error={error}
      isOpen={isOpen}
      matchCount={matchCount}
      onOpenChange={handleOpenChange}
      sourceLabel={presentation.title}
      sourceType={presentation.detail}
      title={track.label || 'Untitled track'}
    >
      <div className="grid gap-card">
        <div className="grid gap-component sm:grid-cols-2">
          <div className="grid gap-item">
            <Label htmlFor={`track-${track.key}-name`}>Track name</Label>
            <Input
              aria-describedby={errors.label ? `track-${track.key}-name-error` : undefined}
              aria-invalid={Boolean(errors.label)}
              id={`track-${track.key}-name`}
              onChange={(event) => setDraft((current) => ({
                ...current,
                label: event.target.value,
              }))}
              placeholder="Track A"
              value={draft.label}
            />
            {errors.label ? (
              <p className="text-label text-destructive" id={`track-${track.key}-name-error`}>
                {errors.label}
              </p>
            ) : null}
          </div>

          <div className="grid gap-item">
            <Label htmlFor={`track-${track.key}-touch-value`}>Activity track</Label>
            <RadixSelect
              onValueChange={(value) => setDraft((current) => ({
                ...current,
                touchTrackValue: value,
              }))}
              value={draft.touchTrackValue}
            >
              <SelectTrigger
                aria-describedby={errors.touchTrackValue
                  ? `track-${track.key}-touch-value-error`
                  : undefined}
                aria-invalid={Boolean(errors.touchTrackValue)}
                id={`track-${track.key}-touch-value`}
              >
                <SelectValue placeholder="Select GHL value" />
              </SelectTrigger>
              <SelectContent>
                {touchTrackOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </RadixSelect>
            {errors.touchTrackValue ? (
              <p
                className="text-label text-destructive"
                id={`track-${track.key}-touch-value-error`}
              >
                {errors.touchTrackValue}
              </p>
            ) : (
              <p className="text-label text-text-muted">
                Value stored on Reactivation Touch activity.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-component">
          <p className="text-ui text-text-secondary">
            Assign contact to {draft.label || 'this track'} when
          </p>
          <MappingRulesEditor
            customFields={customFields}
            errors={errors.mappings}
            idPrefix={`track-${track.key}-rule`}
            mappings={draft.signals}
            onChange={(signals) => setDraft((current) => ({ ...current, signals }))}
            outcomeLabel={draft.label || 'this track'}
            tags={tags}
          />
        </div>

        {error ? <p className="text-label text-destructive">{error}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-item">
          <Button
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            type="button"
            variant="ghost"
          >
            Delete track
          </Button>
          <div className="flex justify-end gap-item">
            <Button onClick={cancelChanges} type="button" variant="ghost">Cancel</Button>
            <Button
              disabled={!draft.label.trim() || !draft.touchTrackValue}
              onClick={applyChanges}
              type="button"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </MappingDisclosure>
  )
}
