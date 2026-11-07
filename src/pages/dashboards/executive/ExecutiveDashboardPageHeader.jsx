import { PageHeader } from '@/shared/ui'

export function ExecutiveDashboardPageHeader({ activeRoute }) {
  return (
    <PageHeader
      title={activeRoute.pageTitle ?? activeRoute.label}
      width={activeRoute.contentWidth}
    />
  )
}
