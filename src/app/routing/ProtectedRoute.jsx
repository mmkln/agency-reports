import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../providers/auth/useAuth'
import { canAccessRoute } from './roleAccess'

export function ProtectedRoute({ children, allowedRoles }) {
  const { viewer } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!viewer) {
      navigate('/login', { replace: true })
      return
    }

    if (!canAccessRoute(viewer, { allowedRoles })) {
      navigate('/access-denied', { replace: true })
    }
  }, [viewer, allowedRoles, navigate])

  if (!viewer) {
    return <div className="p-6 text-sm text-text-muted">Redirecting to sign in...</div>
  }

  if (!canAccessRoute(viewer, { allowedRoles })) {
    return <div className="p-6 text-sm text-text-muted">Checking permissions...</div>
  }

  return children
}
