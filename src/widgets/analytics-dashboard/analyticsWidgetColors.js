const TONE_COLORS = {
  accent: 'var(--chart-4)',
  info: 'var(--chart-1)',
  negative: 'var(--destructive)',
  neutral: 'var(--text-quaternary)',
  positive: 'var(--chart-2)',
  warning: 'var(--chart-3)',
}

export function getAnalyticsToneColor(tone) {
  return TONE_COLORS[tone] ?? TONE_COLORS.neutral
}
