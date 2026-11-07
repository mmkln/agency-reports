import { useState } from 'react'

import { Button } from '@/shared/ui'

import { TrackMappingRow } from './TrackMappingRow'
import {
  findValidationIssueMessage,
  findValidationIssuesForPath,
} from './validationIssues'

export function ReviewTracksSection({
  draft,
  error,
  onAddTrack,
  onRemoveTrack,
  onUpdateTrack,
  options,
  validationResult,
  validationIssues = [],
}) {
  const [expandedTrackIndex, setExpandedTrackIndex] = useState(null)
  const tags = (options.tags ?? []).filter((tag) => (
    tag.sourceConnectionId === draft.sourceConnectionId
  ))
  const customFields = (options.customFields ?? []).filter((field) => (
    field.sourceConnectionId === draft.sourceConnectionId
  ))
  const touchTrackOptions = (options.touchTrackOptions ?? []).filter((option) => (
    option.sourceConnectionId === draft.sourceConnectionId
  ))
  const validationByKey = Object.fromEntries(
    (validationResult?.tracks?.items ?? []).map((track) => [track.key, track.matchCount]),
  )
  const sectionIssues = validationIssues.filter((issue) => issue.path === 'tracks')

  function addTrack() {
    setExpandedTrackIndex(draft.tracks.length)
    onAddTrack()
  }

  return (
    <section className="grid gap-component border-t border-separator pt-card">
      <div className="grid gap-tag">
        <h3 className="text-ui font-semibold text-text-primary">Tracks</h3>
        <p className="text-ui text-text-muted">
          Define the contact signal used to assign each campaign track.
        </p>
      </div>

      {draft.tracks.length ? (
        <div className="overflow-hidden rounded-control bg-block-subtle">
          {draft.tracks.map((track, trackIndex) => {
            const trackIssue = findValidationIssuesForPath(
              validationIssues,
              `tracks.${trackIndex}`,
            ).at(0)
            const mappingErrors = track.signals.map((_signal, signalIndex) => ({
              field: findValidationIssueMessage(
                validationIssues,
                `tracks.${trackIndex}.signals.${signalIndex}.field_id`,
              ),
              values: findValidationIssueMessage(
                validationIssues,
                `tracks.${trackIndex}.signals.${signalIndex}.expected_values`,
              ),
            }))

            return (
              <div
                className={trackIndex < draft.tracks.length - 1 ? 'border-b border-separator' : ''}
                key={track.id || track.key}
              >
                <TrackMappingRow
                  customFields={customFields}
                  error={trackIssue?.message}
                  errors={{
                    label: findValidationIssueMessage(
                      validationIssues,
                      `tracks.${trackIndex}.label`,
                    ),
                    mappings: mappingErrors,
                    touchTrackValue: findValidationIssueMessage(
                      validationIssues,
                      `tracks.${trackIndex}.touch_track_value`,
                    ),
                  }}
                  isOpen={expandedTrackIndex === trackIndex}
                  matchCount={validationByKey[track.key]}
                  onCommit={(nextTrack) => onUpdateTrack(trackIndex, nextTrack)}
                  onDelete={() => {
                    onRemoveTrack(trackIndex)
                    setExpandedTrackIndex(null)
                  }}
                  onOpenChange={(open) => setExpandedTrackIndex(open ? trackIndex : null)}
                  tags={tags}
                  track={track}
                  touchTrackOptions={touchTrackOptions}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-ui text-text-muted">No tracks configured.</p>
      )}

      <div>
        <Button onClick={addTrack} size="sm" type="button" variant="ghost">
          Add track
        </Button>
      </div>

      {error ? <p className="text-label text-destructive">{error}</p> : null}
      {sectionIssues.map((issue) => (
        <p className="text-label text-destructive" key={`${issue.code}-${issue.message}`}>
          {issue.message}
        </p>
      ))}
    </section>
  )
}
