import { useMemo, useState } from 'react'

import { Icon } from '@/shared/icons'
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  Label,
  TooltipIconButton,
} from '@/shared/ui'

import { SignalMappingRow } from './ReviewMappingsSection'

function isConfiguredSignal(signal) {
  if (signal.isActive === false || !signal.expectedValues.length) {
    return false
  }
  if (signal.source === 'tag') {
    return Boolean(signal.entity)
  }
  if (signal.source === 'custom_field') {
    return Boolean(signal.entity && (signal.fieldId || signal.fieldKey))
  }
  return false
}

function isConfiguredTrack(track) {
  return Boolean(track.label.trim()) && track.signals.some(isConfiguredSignal)
}

export function ReviewTracksSection({
  draft,
  error,
  onAddSignal,
  onAddTrack,
  onChangeSignal,
  onChangeTrack,
  onRemoveSignal,
  onRemoveTrack,
  options,
  validationResult,
}) {
  const configuredCount = useMemo(
    () => draft.tracks.filter(isConfiguredTrack).length,
    [draft.tracks],
  )
  const isComplete = draft.tracks.length > 0 && configuredCount === draft.tracks.length
  const [isOpen, setIsOpen] = useState(!isComplete)
  const tracksOpen = isOpen || Boolean(error)
  const tags = (options.tags ?? []).filter(
    (tag) => tag.sourceConnectionId === draft.sourceConnectionId,
  )
  const customFields = (options.customFields ?? []).filter(
    (field) => field.sourceConnectionId === draft.sourceConnectionId,
  )
  const validationByKey = Object.fromEntries(
    (validationResult?.tracks?.items ?? []).map((track) => [track.key, track.matchCount]),
  )

  return (
    <Collapsible
      className="grid gap-component border-t border-separator pt-card"
      onOpenChange={setIsOpen}
      open={tracksOpen}
    >
      <div className="flex items-center justify-between gap-component">
        <span className="grid min-w-0 gap-tag">
          <span className="text-ui font-semibold text-text-primary">Tracks</span>
          <span className="text-label font-normal text-text-muted">
            {configuredCount} of {draft.tracks.length} configured
            {isComplete ? ' · Ready' : ' · Setup incomplete'}
          </span>
        </span>
        <div className="flex items-center gap-item">
          <Button onClick={onAddTrack} size="sm" type="button" variant="outline">
            Add track
          </Button>
          <CollapsibleTrigger asChild>
            <TooltipIconButton
              label={tracksOpen ? 'Collapse tracks' : 'Expand tracks'}
              size="md"
            >
              <Icon
                className={`transition-transform duration-motion-fast ${tracksOpen ? 'rotate-180' : ''}`}
                name="chevronDown"
                size={18}
              />
            </TooltipIconButton>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="grid gap-card">
        <p className="text-ui text-text-muted">
          Define the tracks used by this campaign and the exact GHL signal for each one.
        </p>

        {draft.tracks.length ? (
          <div className="grid gap-card">
            {draft.tracks.map((track, trackIndex) => (
              <div className="grid gap-component" key={track.id || track.key}>
                <div className="flex items-end gap-component">
                  <div className="grid min-w-0 flex-1 gap-item">
                    <Label htmlFor={`review-track-${trackIndex}-label`}>Track name</Label>
                    <Input
                      id={`review-track-${trackIndex}-label`}
                      onChange={(event) => onChangeTrack(trackIndex, { label: event.target.value })}
                      placeholder="Track A"
                      value={track.label}
                    />
                  </div>
                  {validationByKey[track.key] !== undefined ? (
                    <p className="pb-item text-label text-text-muted">
                      {validationByKey[track.key]} matching contacts
                    </p>
                  ) : null}
                  <Button
                    onClick={() => onAddSignal(trackIndex)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Add source
                  </Button>
                  <TooltipIconButton
                    className="text-text-secondary hover:text-destructive"
                    label={`Remove ${track.label}`}
                    onClick={() => onRemoveTrack(trackIndex)}
                    size="md"
                  >
                    <Icon name="trash" size={16} />
                  </TooltipIconButton>
                </div>

                <div className="grid gap-tag overflow-hidden rounded-control">
                  {track.signals.map((signal, signalIndex) => (
                    <SignalMappingRow
                      customFields={customFields}
                      idPrefix={`review-track-${trackIndex}-signal-${signalIndex}`}
                      key={signal.id || `${track.key}-${signalIndex}`}
                      mapping={{ ...signal, label: track.label }}
                      onChange={(changes) => onChangeSignal(trackIndex, signalIndex, changes)}
                      onRemove={() => onRemoveSignal(trackIndex, signalIndex)}
                      tags={tags}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ui text-text-muted">No tracks configured.</p>
        )}

        {error ? <p className="text-label text-destructive">{error}</p> : null}
        {validationResult?.tracks ? (
          <p className="text-label text-text-muted">
            {validationResult.tracks.cohortCount} cohort contacts · 0 unassigned · 0 conflicts
          </p>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}
