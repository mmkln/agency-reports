import { DashboardExplanationPopover } from '@/features/growth-review-dashboard-explanation'

export function CampaignMetricExplanation({
  explanationEditor,
  explanationKey,
  explanations,
}) {
  const explanation = explanations?.[explanationKey]

  if (!explanationKey || !explanation) {
    return null
  }

  return (
    <DashboardExplanationPopover
      {...explanationEditor}
      explanation={explanation}
      explanationKey={explanationKey}
      triggerSize="xs"
    />
  )
}
