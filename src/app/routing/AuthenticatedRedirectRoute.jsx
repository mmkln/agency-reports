import { Navigate, useSearchParams } from 'react-router-dom'

import { getHomeHrefForViewer } from '../../domain/services/viewerHomeService'
import { useAuth } from '../providers/auth/useAuth'
import { getPostLoginHref } from './postLoginRedirect'

export function AuthenticatedRedirectRoute({ children, route }) {
  const { isAuthLoading, viewer } = useAuth()
  const [searchParams] = useSearchParams()

  if (isAuthLoading) {
    return <div className="p-6 text-ui text-text-muted">Checking session...</div>
  }

  if (!viewer || !route?.redirectAuthenticated) {
    return children
  }

  const nextHref = route.id === 'login'
    ? searchParams.get('next')
    : null
  const redirectHref = nextHref
    ? getPostLoginHref({ nextHref, viewer })
    : getHomeHrefForViewer(viewer)

  return <Navigate replace to={redirectHref} />
}
