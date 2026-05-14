import { useId } from 'react'

export function useInspectorId(componentName, providedId) {
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  return providedId ?? `${componentName}-${reactId}`
}
