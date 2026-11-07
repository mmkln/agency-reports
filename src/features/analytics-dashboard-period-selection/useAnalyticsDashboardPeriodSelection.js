import { useState } from 'react'

export function useAnalyticsDashboardPeriodSelection({ dashboardKey, workspaceId }) {
  const contextKey = `${workspaceId ?? ''}:${dashboardKey ?? ''}`
  const [selection, setSelection] = useState({ contextKey, periodKey: null })
  const periodKey = selection.contextKey === contextKey ? selection.periodKey : null

  return {
    periodKey,
    selectPeriod: (nextPeriodKey) => setSelection({
      contextKey,
      periodKey: nextPeriodKey || null,
    }),
  }
}
