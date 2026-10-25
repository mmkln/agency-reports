import { PageHeader } from '@/shared/ui'

export function WeeklyLeadReportPageHeader({ activeRoute }) {
  return <PageHeader title={activeRoute.pageTitle ?? activeRoute.label} width={activeRoute.contentWidth} />
}
