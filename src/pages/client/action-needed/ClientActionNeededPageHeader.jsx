import { Badge, PageHeader } from '@/shared/ui'

import { getClientActionNeededPage } from '../../../domain/services/clientActionNeededService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'

function HeaderActions({ counts }) {
  return (
    <>
      <Badge className="border-warning/20 bg-warning-muted text-warning-foreground" variant="outline">
        {counts.open} open
      </Badge>
      {counts.overdue ? (
        <Badge className="border-destructive/20 bg-destructive/10 text-destructive" variant="outline">
          {counts.overdue} overdue
        </Badge>
      ) : null}
    </>
  )
}

export function ClientActionNeededPageHeader({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:action-needed-header:${clientId}`,
    load: () => runtime.dataClient.read((repositories) => getClientActionNeededPage({
      clientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <PageHeader title="Action Needed" />
  }

  if (pageResource.status === 'error' || page.status === 'error') {
    return <PageHeader title="Access denied" />
  }

  return (
    <PageHeader
      actions={<HeaderActions counts={page.counts} />}
      title="Action Needed"
    />
  )
}
