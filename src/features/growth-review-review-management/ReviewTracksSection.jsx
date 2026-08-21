import { Icon } from '@/shared/icons'
import {
  Button,
  Input,
  Label,
  TooltipIconButton,
} from '@/shared/ui'

import { SignalMappingRow } from './ReviewMappingsSection'

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
    <section className="grid gap-card border-t border-separator pt-card">
      <div className="flex items-start justify-between gap-component">
        <div className="grid gap-tag">
          <h3 className="text-ui font-semibold text-text-primary">Tracks</h3>
          <p className="text-ui text-text-muted">
            Define the tracks used by this campaign and the exact GHL signal for each one.
          </p>
        </div>
        <Button onClick={onAddTrack} size="sm" type="button" variant="outline">
          Add track
        </Button>
      </div>

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
    </section>
  )
}
