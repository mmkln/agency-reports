import { Suspense, useEffect, useMemo, useState } from 'react'
import { USER_ROLES } from '../entities/profile'
import { getCurrentViewer, setAuthSession } from '../domain/services/authService'
import { DemoRoleSwitcher } from './components/DemoRoleSwitcher'
import {
  DEMO_ROLE_STORAGE_KEY,
  getDemoRoleOption,
  getDemoRoleOptionByRole,
} from './providers/session/demoRoleSwitch'
import { portalRepository } from './providers/repositories/portalRepository'
import { canAccessRoute, filterRoutesForViewer } from './routing/roleAccess'
import { AppShell } from '../shared/layout'
import { ToastProvider } from '../shared/notifications'
import { defaultRoute, routes } from './routes'

function createRuntime(viewer) {
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
    repositories: portalRepository,
    viewer: runtimeViewer,
  }
}

function readDemoRoleKey(storage = window.localStorage) {
  try {
    return getDemoRoleOption(storage.getItem(DEMO_ROLE_STORAGE_KEY)).key
  } catch {
    return getDemoRoleOption().key
  }
}

function parseHashRoute() {
  const rawHash = window.location.hash.replace('#', '') || defaultRoute.id
  const [routeId, queryString = ''] = rawHash.split('?')

  return {
    params: Object.fromEntries(new URLSearchParams(queryString)),
    routeId,
    rawHash,
  }
}

function AppContent() {
  const [routeState, setRouteState] = useState(parseHashRoute)
  const [authRevision, setAuthRevision] = useState(0)
  const [demoRoleKey, setDemoRoleKey] = useState(() => readDemoRoleKey())

  useEffect(() => {
    const handleHashChange = () => setRouteState(parseHashRoute())

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const viewer = useMemo(
    () => {
      void authRevision
      void routeState.rawHash
      return getCurrentViewer({ repositories: portalRepository })
    },
    [authRevision, routeState.rawHash],
  )
  const runtime = useMemo(() => createRuntime(viewer), [viewer])
  const activeRoute = useMemo(
    () => routes.find((route) => route.id === routeState.routeId) ?? defaultRoute,
    [routeState.routeId],
  )
  const canAccessActiveRoute = canAccessRoute(runtime.viewer, activeRoute)
  const accessibleRoutes = useMemo(
    () => filterRoutesForViewer(routes, runtime.viewer),
    [runtime.viewer],
  )

  useEffect(() => {
    if (viewer) {
      const viewerRoleKey = getDemoRoleOptionByRole(viewer.role).key

      window.localStorage.setItem(DEMO_ROLE_STORAGE_KEY, viewerRoleKey)
    }
  }, [viewer])

  useEffect(() => {
    if (!viewer && activeRoute.layout !== 'auth' && activeRoute.layout !== 'public') {
      window.location.hash = 'login'
      return
    }

    if (viewer && activeRoute.id === 'login') {
      window.location.hash = runtime.defaultClientId && viewer.role === USER_ROLES.CLIENT_USER
        ? `client-overview?clientId=${runtime.defaultClientId}`
        : 'admin-clients'
      return
    }

    if (viewer && !canAccessActiveRoute) {
      window.location.hash = viewer.role === USER_ROLES.AGENCY_TEAM
        ? 'team-tasks'
        : viewer.role === USER_ROLES.CLIENT_USER
          ? `client-overview?clientId=${runtime.defaultClientId}`
          : 'admin-clients'
    }
  }, [activeRoute.id, activeRoute.layout, canAccessActiveRoute, runtime.defaultClientId, viewer])

  const handleDemoRoleChange = (roleKey) => {
    const option = getDemoRoleOption(roleKey)

    window.localStorage.setItem(DEMO_ROLE_STORAGE_KEY, option.key)
    setAuthSession(option.userId)
    setDemoRoleKey(option.key)
    window.location.hash = option.homeHref
    setRouteState(parseHashRoute())
    setAuthRevision((currentRevision) => currentRevision + 1)
  }

  const ActivePage = activeRoute.component
  const activePageElement = (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading...</div>}>
      {canAccessActiveRoute ? (
        <ActivePage
          key={routeState.rawHash}
          onAuthChange={() => setAuthRevision((currentRevision) => currentRevision + 1)}
          routeParams={routeState.params}
          runtime={runtime}
        />
      ) : (
        <div className="p-6 text-sm text-slate-500">Switching role context...</div>
      )}
    </Suspense>
  )
  const demoRoleSwitcher = (
    <DemoRoleSwitcher
      activeRoleKey={viewer ? getDemoRoleOptionByRole(viewer.role).key : demoRoleKey}
      onRoleChange={handleDemoRoleChange}
    />
  )

  if (activeRoute.layout === 'auth' || activeRoute.layout === 'public') {
    return (
      <>
        {activePageElement}
        {demoRoleSwitcher}
      </>
    )
  }

  if (!viewer) {
    return (
      <>
        <main className="min-h-screen bg-slate-50 p-6 text-sm text-slate-500">
          Redirecting to sign in...
        </main>
        {demoRoleSwitcher}
      </>
    )
  }

  return (
    <>
      <AppShell
        activeRoute={activeRoute}
        defaultRoute={defaultRoute}
        onAuthChange={() => setAuthRevision((currentRevision) => currentRevision + 1)}
        routeParams={routeState.params}
        runtime={runtime}
        showRouteHeader={canAccessActiveRoute}
        routes={accessibleRoutes}
      >
        {activePageElement}
      </AppShell>
      {demoRoleSwitcher}
    </>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App
