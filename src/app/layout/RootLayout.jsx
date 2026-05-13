import { Outlet } from 'react-router-dom'
import { useAuth } from '../providers/auth/useAuth'
import { AppShell } from '../../shared/layout'
import { DemoRoleSwitcher } from '../components/DemoRoleSwitcher'
import { routeMetadata } from '../routing/router'
import {
  getDemoRoleOption,
  getDemoRoleOptionByRole,
  readDemoRoleKey,
  writeDemoRoleKey,
} from '../providers/session/demoRoleSwitch'
import { useState } from 'react'

export function RootLayout() {
  const { viewer } = useAuth()
  const [demoRoleKey, setDemoRoleKey] = useState(() => readDemoRoleKey())

  const handleDemoRoleChange = (roleKey) => {
    const option = getDemoRoleOption(roleKey)
    writeDemoRoleKey(option.key)
    setDemoRoleKey(option.key)
  }

  if (!viewer) {
    return (
      <>
        <main className="min-h-screen bg-slate-50 p-6 text-sm text-slate-500">
          Redirecting to sign in...
        </main>
        <DemoRoleSwitcher
          activeRoleKey={demoRoleKey}
          onRoleChange={handleDemoRoleChange}
        />
      </>
    )
  }

  const accessibleRoutes = routeMetadata.filter((route) => {
    if (!route.allowedRoles?.length) return true
    return route.allowedRoles.includes(viewer.role)
  })

  return (
    <>
      <AppShell routes={accessibleRoutes} viewer={viewer}>
        <Outlet />
      </AppShell>
      <DemoRoleSwitcher
        activeRoleKey={viewer ? getDemoRoleOptionByRole(viewer.role).key : demoRoleKey}
        onRoleChange={handleDemoRoleChange}
      />
    </>
  )
}
