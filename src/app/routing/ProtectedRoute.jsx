import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../providers/auth/useAuth'
import {
  canAccessRouteWithContext,
  getRouteClientId,
  isClientScopedRoute,
} from './roleAccess'
import { getRouteAccessClientContext } from '../../domain/services/routeAccessContextService'
import { useAsyncResource } from '../../shared/data/useAsyncResource'

export function ProtectedRoute({ children, allowedRoles, requiredCapabilities, route }) {
  const { runtime, viewer } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const routeParams = Object.fromEntries(searchParams.entries())
  const routeForAccess = route ?? { allowedRoles, requiredCapabilities }
  const routeClientId = getRouteClientId({
    defaultClientId: runtime.defaultClientId,
    routeParams,
    viewer,
  })
  const routeAccessContextResource = useAsyncResource({
    dependencyKey: `${viewer?.userId ?? 'anonymous'}:protected-route-access:${routeForAccess?.id ?? routeForAccess?.path ?? ''}:${routeClientId ?? ''}`,
    initialData: null,
    load: () => {
      if (!viewer || !isClientScopedRoute(routeForAccess)) {
        return Promise.resolve(null)
      }

      return runtime.dataClient.read((repositories) => getRouteAccessClientContext({
        clientId: routeClientId,
        repositories,
      }))
    },
  })
  const isCheckingContext = Boolean(
    viewer
    && isClientScopedRoute(routeForAccess)
    && routeAccessContextResource.status === 'loading',
  )
  const canAccess = canAccessRouteWithContext(viewer, routeForAccess, {
    clientType: routeAccessContextResource.data?.clientType,
    defaultClientId: runtime.defaultClientId,
    routeParams,
  })

  useEffect(() => {
    if (!viewer) {
      navigate('/login', { replace: true })
      return
    }

    if (!isCheckingContext && !canAccess) {
      navigate('/access-denied', { replace: true })
    }
  }, [canAccess, isCheckingContext, navigate, viewer])

  if (!viewer) {
    return <div className="p-6 text-ui text-text-muted">Redirecting to sign in...</div>
  }

  if (isCheckingContext || !canAccess) {
    return <div className="p-6 text-ui text-text-muted">Checking permissions...</div>
  }

  return children
}
