import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildAuthRuntime } from './authRuntime'
import { AuthContext } from './AuthContext'
import { createDjangoSessionAuthClient } from './djangoSessionAuthClient'

const removedLocalDataClient = Object.freeze({
  read() {
    return Promise.reject(new Error('Local portal repository reads were removed. Add a backend API read path for this screen.'))
  },
  write() {
    return Promise.reject(new Error('Local portal repository writes were removed. Add a backend API mutation path for this workflow.'))
  },
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
    dataClient: removedLocalDataClient,
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
    dataClient: removedLocalDataClient,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
