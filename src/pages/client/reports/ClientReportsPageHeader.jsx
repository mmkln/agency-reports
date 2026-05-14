import { Badge, PageHeader } from '@/shared/ui'

import { getClientReportsPage } from '../../../domain/services/clientReportsService'

function HeaderAction({ reportCount }) {
  return (
    <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
      {reportCount} report{reportCount === 1 ? '' : 's'}
    </Badge>
  )
}

export function ClientReportsPageHeader({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClientReportsPage({
    clientId,
    reportId: routeParams.reportId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

  if (page.status === 'error') {
    return <PageHeader title="Access denied" />
  }

  return (
    <PageHeader
      actions={<HeaderAction reportCount={page.reports.length} />}
      title="Monthly Reports"
    />
  )
}
