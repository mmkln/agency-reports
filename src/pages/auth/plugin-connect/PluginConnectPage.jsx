import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useAuth } from '../../../app/providers/auth/useAuth'
import {
  parsePluginAuthorizationRequest,
  PluginAuthorizationPanel,
} from '../../../features/plugin-authorization'

export function PluginConnectPage() {
  const auth = useAuth()
  const [searchParams] = useSearchParams()
  const requestResult = useMemo(
    () => parsePluginAuthorizationRequest(searchParams),
    [searchParams],
  )

  return (
    <PluginAuthorizationPanel
      apiClient={auth.runtime.apiClient}
      requestResult={requestResult}
      viewer={auth.viewer}
    />
  )
}
