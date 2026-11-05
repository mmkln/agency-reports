import { cn } from '@/lib/utils'

import { formatAnalyticsCumulativeLabel } from './analyticsValueFormatting'

export function AnalyticsCumulativeValue({ className, cumulative, unit = 'count' }) {
  const label = formatAnalyticsCumulativeLabel(cumulative, unit)
  if (!label) {
    return null
  }
  return <p className={cn('text-label font-medium text-text-muted', className)}>{label}</p>
}
