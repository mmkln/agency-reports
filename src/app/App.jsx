import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '../shared/layout'
import { defaultRoute, routes } from './routes'

function getRouteIdFromHash() {
  return window.location.hash.replace('#', '') || defaultRoute.id
}

function App() {
  const [routeId, setRouteId] = useState(getRouteIdFromHash)

  useEffect(() => {
    const handleHashChange = () => setRouteId(getRouteIdFromHash())

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const activeRoute = useMemo(
    () => routes.find((route) => route.id === routeId) ?? defaultRoute,
    [routeId],
  )
  const ActivePage = activeRoute.component

  if (activeRoute.layout === 'auth' || activeRoute.layout === 'public') {
    return <ActivePage />
  }

  return (
    <AppShell activeRoute={activeRoute} defaultRoute={defaultRoute} routes={routes}>
      <ActivePage />
    </AppShell>
  )
}

export default App
