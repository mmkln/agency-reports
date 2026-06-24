import { getAppBaseHref } from '@/shared/routing'

export function ExecutiveDashboardPage() {
  const src = `${getAppBaseHref()}dashboards/executive-dashboard.html`
  return (
    <div className="h-screen w-full">
      <iframe
        className="block h-full w-full border-0"
        src={src}
        title="Inspo Dental — Executive Monthly Review"
      />
    </div>
  )
}
