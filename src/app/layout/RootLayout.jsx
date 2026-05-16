import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useAuth } from '../providers/auth/useAuth'
import { AppShell } from '../../shared/layout'
import { DemoRoleSwitcher } from '../components/DemoRoleSwitcher'
import { canAccessRoute, filterRoutesForViewer } from '../routing/roleAccess'
import { getPathFromLegacyHash } from '../routing/legacyHashRoutes'
import { routeMetadata } from '../routing/routeMetadata'
import {
  getDemoRoleOption,
  getDemoRoleOptionByRole,
  readDemoRoleKey,
  writeDemoRoleKey,
} from '../providers/session/demoRoleSwitch'

export function RootLayout() {
  const { onAuthChange, onLogin, runtime, viewer } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [demoRoleKey, setDemoRoleKey] = useState(() => readDemoRoleKey())

  useEffect(() => {
    const nextPath = getPathFromLegacyHash(location.hash, viewer)

    if (nextPath) {
      navigate(nextPath, { replace: true })
    }
  }, [location.hash, navigate, viewer])

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
