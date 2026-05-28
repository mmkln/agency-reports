import { useCallback, useEffect, useMemo, useState } from 'react'
import { portalRepository } from '../repositories/portalRepository'
import {
  createPortalDataClient,
  PORTAL_DATA_CLIENT_ADAPTERS,
} from '../repositories/createPortalDataClient'
import { buildAuthRuntime } from './authRuntime'
import { AuthContext } from './AuthContext'
import { createDjangoSessionAuthClient } from './djangoSessionAuthClient'

const portalDataClient = createPortalDataClient({
  adapter: import.meta.env.VITE_PORTAL_DATA_CLIENT_ADAPTER ?? PORTAL_DATA_CLIENT_ADAPTERS.LOCAL_REPOSITORY,
  repositories: portalRepository,
})
const portalAuthClient = createDjangoSessionAuthClient()

export function AuthProvider({ children }) {
  const [authRevision, setAuthRevision] = useState(0)
  const [viewer, setViewer] = useState(null)
  const [authStatus, setAuthStatus] = useState('loading')

  const refreshAuth = useCallback(() => {
    setAuthStatus('loading')

    return portalAuthClient.getCurrentViewer()
      .then((nextViewer) => {
        setViewer(nextViewer)
        setAuthStatus('ready')
        return nextViewer
      })
      .catch((error) => {
        setViewer(null)
        setAuthStatus('error')
        throw error
      })
  }, [])

  useEffect(() => {
    void Promise.resolve().then(() => refreshAuth()).catch(() => {})
  }, [refreshAuth])

  const runtime = useMemo(() => buildAuthRuntime({
    dataClient: portalDataClient,
    skipRepositoryRouteContext: true,
    viewer,
  }), [viewer])

  const handleAuthChange = useCallback(() => {
    setAuthRevision((current) => current + 1)
    void refreshAuth().catch(() => {})
  }, [refreshAuth])

  const handleSignIn = useCallback((credentials) => (
    portalAuthClient.signInWithUsername(credentials)
      .then((nextViewer) => {
        setViewer(nextViewer)
        setAuthStatus('ready')
        handleAuthChange()
        return nextViewer
      })
  ), [handleAuthChange])

  const handleSignOut = useCallback(() => {
    void portalAuthClient.signOut().finally(() => {
      setViewer(null)
      handleAuthChange()
    })
  }, [handleAuthChange])

  const value = {
    viewer,
    isAuthLoading: authStatus === 'loading',
    authStatus,
    runtime,
    authRevision,
    authClient: portalAuthClient,
    onAuthChange: handleAuthChange,
    onSignIn: handleSignIn,
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
