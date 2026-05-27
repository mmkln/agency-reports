import { useCallback, useEffect, useMemo, useState } from 'react'
import { portalRepository } from '../repositories/portalRepository'
import {
  createPortalDataClient,
  PORTAL_DATA_CLIENT_ADAPTERS,
} from '../repositories/createPortalDataClient'
import { buildAuthRuntime } from './authRuntime'
import { AuthContext } from './AuthContext'
import { AUTH_ADAPTERS } from './authAdapters'
import { createDjangoSessionAuthClient } from './djangoSessionAuthClient'
import { createLocalAuthClient } from './localAuthClient'

const authAdapter = import.meta.env.VITE_AUTH_ADAPTER ?? AUTH_ADAPTERS.LOCAL

const portalDataClient = createPortalDataClient({
  adapter: import.meta.env.VITE_PORTAL_DATA_CLIENT_ADAPTER ?? PORTAL_DATA_CLIENT_ADAPTERS.LOCAL_REPOSITORY,
  repositories: portalRepository,
})
const localAuthClient = createLocalAuthClient({
  dataClient: portalDataClient,
  repositories: portalRepository,
})
const portalAuthClient = authAdapter === AUTH_ADAPTERS.DJANGO_SESSION
  ? createDjangoSessionAuthClient()
  : localAuthClient

export function AuthProvider({ children }) {
  const [authRevision, setAuthRevision] = useState(0)
  const [viewer, setViewer] = useState(() => (
    authAdapter === AUTH_ADAPTERS.DJANGO_SESSION
      ? null
      : portalAuthClient.getCurrentViewer()
  ))
  const [authStatus, setAuthStatus] = useState(
    authAdapter === AUTH_ADAPTERS.DJANGO_SESSION ? 'loading' : 'ready',
  )

  const refreshAuth = useCallback(() => {
    if (authAdapter !== AUTH_ADAPTERS.DJANGO_SESSION) {
      const nextViewer = portalAuthClient.getCurrentViewer()
      setViewer(nextViewer)
      setAuthStatus('ready')
      return Promise.resolve(nextViewer)
    }

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
    if (authAdapter === AUTH_ADAPTERS.DJANGO_SESSION) {
      void Promise.resolve().then(() => refreshAuth()).catch(() => {})
    }
  }, [refreshAuth])

  const runtime = useMemo(() => buildAuthRuntime({
    dataClient: portalDataClient,
    skipRepositoryRouteContext: authAdapter === AUTH_ADAPTERS.DJANGO_SESSION,
    viewer,
  }), [viewer])

  const handleAuthChange = useCallback(() => {
    setAuthRevision((current) => current + 1)
    if (authAdapter === AUTH_ADAPTERS.DJANGO_SESSION) {
      void refreshAuth().catch(() => {})
      return
    }

    setViewer(portalAuthClient.getCurrentViewer())
    setAuthStatus('ready')
  }, [refreshAuth])

  const handleDemoLogin = useCallback((userId) => {
    void portalAuthClient.startDemoSession(userId)
    handleAuthChange()
  }, [handleAuthChange])

  const handleSignIn = useCallback((credentials) => (
    portalAuthClient.signInWithEmail(credentials)
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
    authAdapter,
    viewer,
    isAuthLoading: authStatus === 'loading',
    authStatus,
    runtime,
    authRevision,
    authClient: portalAuthClient,
    onAuthChange: handleAuthChange,
    onLogin: handleDemoLogin,
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
