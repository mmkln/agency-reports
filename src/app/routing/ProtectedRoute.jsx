import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../providers/auth/useAuth'
import { canAccessRouteWithContext } from './roleAccess'

export function ProtectedRoute({ children, route }) {
  const { isAuthLoading, runtime, viewer } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const routeParams = Object.fromEntries(searchParams.entries())
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
      navigate('/access-denied', { replace: true })
    }
  }, [canAccess, isAuthLoading, location.pathname, location.search, navigate, viewer])

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
