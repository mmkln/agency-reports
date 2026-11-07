import { DashboardExplanationPopover } from '@/features/dashboard-explanation'

export function AnalyticsExplanationPopover({
  explanationEditor,
  explanationKey,
  explanations,
  triggerSize,
}) {
  const explanation = explanations?.[explanationKey]

  if (!explanation) {
    return null
  }

  return (
    <DashboardExplanationPopover
      {...explanationEditor}
      explanation={explanation}
      explanationKey={explanationKey}
      triggerSize={triggerSize}
    />
  )
}
