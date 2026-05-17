import { PageHeader } from '@/shared/ui'

export function ClientReportsPageHeader({ activeRoute }) {
  return <PageHeader title="Reports & Dashboards" width={activeRoute?.contentWidth} />
}
