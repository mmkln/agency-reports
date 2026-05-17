import { Badge, PageHeader } from '@/shared/ui'

import { getClientProjectsPage } from '../../../domain/services/clientProjectsService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'

function HeaderActions({ projectCount }) {
  return (
    <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
      {projectCount} project{projectCount === 1 ? '' : 's'}
    </Badge>
  )
}

export function ClientProjectsPageHeader({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:projects-header:${clientId}:${routeParams.projectId ?? ''}`,
    load: () => runtime.dataClient.read((repositories) => getClientProjectsPage({
      clientId,
      projectId: routeParams.projectId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <PageHeader title="Projects" />
  }

  if (pageResource.status === 'error' || page.status === 'error') {
    return <PageHeader title="Access denied" />
  }

  return (
    <PageHeader
      actions={<HeaderActions projectCount={page.projects.length} />}
      title="Projects"
    />
  )
}
