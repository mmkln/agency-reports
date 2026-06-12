export const reactivationColors = {
  booking: 'var(--success)',
  bookingDark: 'var(--chart-2)',
  email: 'var(--chart-4)',
  sms: 'var(--premium-indigo)',
  trackA: 'var(--chart-1)',
  trackB: 'var(--chart-5)',
  trackC: 'var(--premium-purple)',
  trackR: 'var(--text-quaternary)',
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
  body: 'mt-component',
  footer: 'mt-control border-t border-separator pt-control text-label font-normal text-text-muted',
  header: 'flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between',
  headerAction: 'flex flex-wrap gap-3 sm:justify-end',
}
