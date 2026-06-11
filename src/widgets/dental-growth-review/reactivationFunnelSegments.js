import { chartColorSequence } from '@/shared/theme/chartColors'

import { reactivationTrackColors } from './reactivationChartTheme'

export const ALL_SEGMENTS_KEY = 'all'

export function createFunnelSegmentOptions(series = []) {
  return [
    {
      color: 'var(--premium-indigo)',
      id: ALL_SEGMENTS_KEY,
      label: 'All',
    },
    ...series.map((track, index) => {
      const trackKey = getTrackKey(track, index)

      return {
        color: getTrackColor(trackKey, index),
        id: String(track.id ?? track.key ?? `track-${index}`),
        label: getTrackLabel(track, trackKey, index),
      }
    }),
  ]
}

export function getTrackColor(trackKey, index) {
  return reactivationTrackColors[trackKey]
    ?? chartColorSequence[index % chartColorSequence.length]
    ?? reactivationTrackColors.unknown
}

export function getTrackKey(track, index) {
  const source = String(track.key ?? track.id ?? track.label ?? `track-${index}`).trim()
  const compact = source.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const segmentMatch = compact.match(/([ABCR])$/)

  return segmentMatch?.[1] ?? compact
}

export function getTrackLabel(track, trackKey, index) {
  const explicitLabel = String(track.label ?? '').trim()

  if (explicitLabel) {
    return explicitLabel
  }

  return ['A', 'B', 'C', 'R'].includes(trackKey)
    ? `Segment ${trackKey}`
    : `Track ${index + 1}`
}
