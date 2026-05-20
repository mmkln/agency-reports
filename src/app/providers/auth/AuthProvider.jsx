import { useCallback, useMemo, useState } from 'react'
import { getCurrentViewer, setAuthSession } from '../../../domain/services/authService'
import { portalRepository } from '../repositories/portalRepository'
import { createAsyncPortalDataClient } from '../repositories/createAsyncPortalDataClient'
import { buildAuthRuntime } from './authRuntime'
import { AuthContext } from './AuthContext'

const portalDataClient = createAsyncPortalDataClient({
  repositories: portalRepository,
})

export function AuthProvider({ children }) {
  const [authRevision, setAuthRevision] = useState(0)

  const viewer = useMemo(() => {
    void authRevision
    return getCurrentViewer({ repositories: portalRepository })
  }, [authRevision])

  const runtime = useMemo(() => buildAuthRuntime({
    dataClient: portalDataClient,
    repositories: portalRepository,
    viewer,
  }), [viewer])

  const handleAuthChange = useCallback(() => {
    setAuthRevision((current) => current + 1)
  }, [])

  const handleLogin = useCallback((userId) => {
    setAuthSession(userId)
    handleAuthChange()
  }, [handleAuthChange])

  const value = {
    viewer,
    runtime,
    authRevision,
    onAuthChange: handleAuthChange,
    onLogin: handleLogin,
    dataClient: portalDataClient,
    repositories: portalRepository,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
