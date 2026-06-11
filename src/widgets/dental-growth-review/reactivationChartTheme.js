export const reactivationColors = {
  booking: '#22c55e',
  bookingDark: '#10b981',
  email: '#a78bfa',
  sms: '#6366f1',
  trackA: '#a5b4fc',
  trackB: '#38bdf8',
  trackC: '#c084fc',
  trackR: '#cbd5e1',
  unknownTrack: 'var(--text-quaternary)',
}

export const reactivationTrackColors = {
  A: reactivationColors.trackA,
  B: reactivationColors.trackB,
  C: reactivationColors.trackC,
  R: reactivationColors.trackR,
  unknown: reactivationColors.unknownTrack,
}

export const reactivationChartLayout = {
  body: 'mt-6',
  footer: 'mt-control border-t border-separator pt-control text-label font-normal text-text-muted',
  header: 'flex flex-col gap-4 border-b border-separator pb-4 sm:flex-row sm:items-start sm:justify-between',
  headerAction: 'flex flex-wrap gap-3 sm:justify-end',
}
