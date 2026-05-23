import { useCallback, useMemo, useState } from 'react'
import { portalRepository } from '../repositories/portalRepository'
import {
  createPortalDataClient,
  PORTAL_DATA_CLIENT_ADAPTERS,
} from '../repositories/createPortalDataClient'
import { buildAuthRuntime } from './authRuntime'
import { AuthContext } from './AuthContext'
import { createLocalAuthClient } from './localAuthClient'

const portalDataClient = createPortalDataClient({
  adapter: import.meta.env.VITE_PORTAL_DATA_CLIENT_ADAPTER ?? PORTAL_DATA_CLIENT_ADAPTERS.LOCAL_REPOSITORY,
  repositories: portalRepository,
})
const portalAuthClient = createLocalAuthClient({
  dataClient: portalDataClient,
  repositories: portalRepository,
})

export function AuthProvider({ children }) {
  const [authRevision, setAuthRevision] = useState(0)

  const viewer = useMemo(() => {
    void authRevision
    return portalAuthClient.getCurrentViewer()
  }, [authRevision])

  const runtime = useMemo(() => buildAuthRuntime({
    dataClient: portalDataClient,
    viewer,
  }), [viewer])

  const handleAuthChange = useCallback(() => {
    setAuthRevision((current) => current + 1)
  }, [])

  const handleLogin = useCallback((userId) => {
    void portalAuthClient.startDemoSession(userId)
    handleAuthChange()
  }, [handleAuthChange])

  const handleSignOut = useCallback(() => {
    void portalAuthClient.signOut()
    handleAuthChange()
  }, [handleAuthChange])

  const value = {
    viewer,
    runtime,
    authRevision,
    authClient: portalAuthClient,
    onAuthChange: handleAuthChange,
    onLogin: handleLogin,
    onSignOut: handleSignOut,
    dataClient: portalDataClient,
    repositories: portalRepository,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
