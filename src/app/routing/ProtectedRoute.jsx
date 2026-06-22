import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { useAuth } from '../providers/auth/useAuth'
import { canAccessRouteWithContext, getRouteAccessDiagnostic } from './roleAccess'

export function ProtectedRoute({ children, route }) {
  const { isAuthLoading, runtime, viewer } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const routeParams = useMemo(() => (
    {
      ...params,
      ...Object.fromEntries(searchParams.entries()),
    }
  ), [params, searchParams])
  const canAccess = canAccessRouteWithContext(viewer, route, {
    defaultClientId: runtime.defaultClientId,
    routeParams,
  })

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!viewer) {
      const nextPath = `${location.pathname}${location.search}`
      const loginHref = nextPath && nextPath !== '/login'
        ? `/login?next=${encodeURIComponent(nextPath)}`
        : '/login'

      navigate(loginHref, { replace: true })
      return
    }

    if (!canAccess) {
      if (import.meta.env.DEV) {
        console.warn('[route-access-denied]', getRouteAccessDiagnostic(viewer, route, {
          defaultClientId: runtime.defaultClientId,
          routeParams,
        }))
      }

      navigate('/access-denied', { replace: true })
    }
  }, [canAccess, isAuthLoading, location.pathname, location.search, navigate, route, routeParams, runtime.defaultClientId, viewer])

  if (isAuthLoading) {
    return <div className="p-6 text-ui text-text-muted">Checking session...</div>
  }

  if (!viewer) {
    return <div className="p-6 text-ui text-text-muted">Redirecting to sign in...</div>
  }

  if (!canAccess) {
    return <div className="p-6 text-ui text-text-muted">Checking permissions...</div>
  }

  return children
}
