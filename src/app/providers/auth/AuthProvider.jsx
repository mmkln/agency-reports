import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildAuthRuntime } from './authRuntime'
import { AuthContext } from './AuthContext'
import { createAuthApiClient } from './authApiClient'
import { createBackendAuthClient } from './backendAuthClient'
import { createBrowserAuthTokenStorage } from './browserAuthTokenStorage'
import { createTokenAuthenticatedApiClient } from './tokenAuthenticatedApiClient'

const removedLocalDataClient = Object.freeze({
  read() {
    return Promise.reject(new Error('Local portal repository reads were removed. Add a backend API read path for this screen.'))
  },
  write() {
    return Promise.reject(new Error('Local portal repository writes were removed. Add a backend API mutation path for this workflow.'))
  },
})

const authTokenStorage = createBrowserAuthTokenStorage()

export function AuthProvider({ children }) {
  const [authRevision, setAuthRevision] = useState(0)
  const [viewer, setViewer] = useState(null)
  const [authStatus, setAuthStatus] = useState('loading')
  const handleSessionExpired = useCallback(() => {
    setViewer(null)
    setAuthStatus('ready')
    setAuthRevision((current) => current + 1)
  }, [])
  const backendApiClient = useMemo(() => createTokenAuthenticatedApiClient({
    onSessionExpired: handleSessionExpired,
    tokenStorage: authTokenStorage,
  }), [handleSessionExpired])
  const portalAuthClient = useMemo(() => createBackendAuthClient({
    apiClient: createAuthApiClient({ apiClient: backendApiClient }),
    tokenStorage: authTokenStorage,
  }), [backendApiClient])

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
  }, [portalAuthClient])

  useEffect(() => {
    void Promise.resolve().then(() => refreshAuth()).catch(() => {})
  }, [refreshAuth])

  const runtime = useMemo(() => buildAuthRuntime({
    apiClient: backendApiClient,
    dataClient: removedLocalDataClient,
    skipRepositoryRouteContext: true,
    viewer,
  }), [backendApiClient, viewer])

  const handleAuthChange = useCallback(() => {
    setAuthRevision((current) => current + 1)
    void refreshAuth().catch(() => {})
  }, [refreshAuth])

  const handleSignIn = useCallback((credentials) => (
    portalAuthClient.signInWithEmail(credentials)
      .then((nextViewer) => {
        setViewer(nextViewer)
        setAuthStatus('ready')
        handleAuthChange()
        return nextViewer
      })
  ), [handleAuthChange, portalAuthClient])

  const handleEmailCodeSignIn = useCallback((credentials) => (
    portalAuthClient.signInWithEmailCode(credentials)
      .then((nextViewer) => {
        setViewer(nextViewer)
        setAuthStatus('ready')
        handleAuthChange()
        return nextViewer
      })
  ), [handleAuthChange, portalAuthClient])

  const handleSignOut = useCallback(() => {
    void portalAuthClient.signOut().finally(() => {
      setViewer(null)
      handleAuthChange()
    })
  }, [handleAuthChange, portalAuthClient])

  const value = {
    viewer,
    isAuthLoading: authStatus === 'loading',
    authStatus,
    runtime,
    authRevision,
    authClient: portalAuthClient,
    onAuthChange: handleAuthChange,
    onEmailCodeSignIn: handleEmailCodeSignIn,
    onSignIn: handleSignIn,
    onSignOut: handleSignOut,
    dataClient: removedLocalDataClient,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
