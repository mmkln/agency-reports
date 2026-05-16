import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useAuth } from '../providers/auth/useAuth'
import { AppShell } from '../../shared/layout'
import { DemoRoleSwitcher } from '../components/DemoRoleSwitcher'
import { canAccessRoute, filterRoutesForViewer } from '../routing/roleAccess'
import { routeMetadata } from '../routing/routeDefinitions'
import {
  getDemoRoleOption,
  getDemoRoleOptionByRole,
  readDemoRoleKey,
  writeDemoRoleKey,
} from '../providers/session/demoRoleSwitch'

const legacyHashRouteMap = Object.freeze({
  '#client-dashboard': '/client/dashboard',
  '#client-overview': '/client/overview',
  '#client-performance': '/client/performance',
  '#dashboard': '/client/dashboard',
  '#performance': '/client/performance',
  '#performance-dashboard': '/client/performance',
})

export function RootLayout() {
  const { onAuthChange, onLogin, runtime, viewer } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [demoRoleKey, setDemoRoleKey] = useState(() => readDemoRoleKey())

  useEffect(() => {
    const hashRoute = legacyHashRouteMap[location.hash]

    if (!hashRoute || location.pathname !== '/') {
      return
    }

    const nextParams = new URLSearchParams(searchParams)

    if (runtime.defaultClientId && !nextParams.has('clientId')) {
      nextParams.set('clientId', runtime.defaultClientId)
    }

    const queryString = nextParams.toString()
    navigate(`${hashRoute}${queryString ? `?${queryString}` : ''}`, { replace: true })
  }, [location.hash, location.pathname, navigate, runtime.defaultClientId, searchParams])

  const handleDemoRoleChange = (roleKey) => {
    const option = getDemoRoleOption(roleKey)
    writeDemoRoleKey(option.key)
    setDemoRoleKey(option.key)
    flushSync(() => {
      onLogin(option.userId)
    })
    navigate(option.homeHref, { replace: true })
  }

  if (!viewer) {
    return <Outlet />
  }

  const activeRoute = routeMetadata.find((route) => route.path === location.pathname) ?? routeMetadata[0]

  if (activeRoute.layout === 'auth' || activeRoute.layout === 'public') {
    return <Outlet />
  }

  const canAccessActiveRoute = canAccessRoute(viewer, activeRoute)

  if (!canAccessActiveRoute) {
    return <Outlet />
  }

  const routeParams = Object.fromEntries(searchParams.entries())

  const accessibleRoutes = filterRoutesForViewer(routeMetadata, viewer)

  return (
    <>
      <AppShell
        activeRoute={activeRoute}
        onAuthChange={onAuthChange}
        routeParams={routeParams}
        runtime={runtime}
        routes={accessibleRoutes}
      >
        <Outlet />
      </AppShell>
      <DemoRoleSwitcher
        activeRoleKey={viewer ? getDemoRoleOptionByRole(viewer.role).key : demoRoleKey}
        onRoleChange={handleDemoRoleChange}
      />
    </>
  )
}
