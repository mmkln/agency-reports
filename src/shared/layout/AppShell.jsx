import { PageHeader } from './PageHeader'
import { TopNav } from './TopNav'

export function AppShell({ activeRoute, children, defaultRoute, routes }) {
  const navRoutes = routes.filter((route) => route.showInNav !== false)

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <TopNav activeRoute={activeRoute} defaultRoute={defaultRoute} routes={navRoutes} />
      <PageHeader
        subtitle="Complete marketing automation & patient management"
        title={activeRoute.pageTitle ?? activeRoute.label}
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8" key={activeRoute.id}>
        {children}
      </div>
    </main>
  )
}
