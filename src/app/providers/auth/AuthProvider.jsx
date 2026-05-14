import { useCallback, useMemo, useState } from 'react'
import { USER_ROLES } from '../../../entities/profile'
import { getCurrentViewer, setAuthSession } from '../../../domain/services/authService'
import { portalRepository } from '../repositories/portalRepository'
import { createAsyncPortalDataClient } from '../repositories/createAsyncPortalDataClient'
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

  const runtime = useMemo(() => {
    const agencyClientIds = viewer?.agencyId
      ? portalRepository.clients
        .list()
        .filter((client) => client.agency_id === viewer.agencyId)
        .map((client) => client.id)
      : []
    const runtimeViewer = viewer?.role === USER_ROLES.AGENCY_TEAM
      ? {
          ...viewer,
          clientIds: [...new Set([...(viewer.clientIds ?? []), ...agencyClientIds])],
        }
      : viewer

    return {
      defaultClientId: runtimeViewer?.role === USER_ROLES.AGENCY_ADMIN
        ? portalRepository.clients.list()[0]?.id ?? null
        : runtimeViewer?.clientId ?? runtimeViewer?.clientIds?.[0] ?? null,
      dataClient: portalDataClient,
      repositories: portalRepository,
      viewer: runtimeViewer,
    }
  }, [viewer])

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
