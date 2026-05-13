import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../providers/auth/useAuth'

export function ProtectedRoute({ children, allowedRoles }) {
  const { viewer } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!viewer) {
      navigate('/login', { replace: true })
      return
    }

    if (allowedRoles?.length && !allowedRoles.includes(viewer.role)) {
      navigate('/access-denied', { replace: true })
    }
  }, [viewer, allowedRoles, navigate])

  if (!viewer) {
    return <div className="p-6 text-sm text-slate-500">Redirecting to sign in...</div>
  }

  if (allowedRoles?.length && !allowedRoles.includes(viewer.role)) {
    return <div className="p-6 text-sm text-slate-500">Checking permissions...</div>
  }

  return children
}
