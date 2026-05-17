import { getClientProjectsPage } from '../../../domain/services/clientProjectsService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Panel, PanelBody } from '@/shared/ui'
import { AccessDeniedState } from '../../../widgets/client-overview'
import {
  ProjectDetailSection,
  ProjectsListSection,
} from '../../../widgets/client-projects'

export function ClientProjectsPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-projects:${clientId}:${routeParams.projectId ?? ''}`,
    load: () => runtime.dataClient.read((repositories) => getClientProjectsPage({
      clientId,
      projectId: routeParams.projectId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return (
      <Panel>
        <PanelBody className="min-h-[260px] animate-pulse" />
      </Panel>
    )
  }

  if (pageResource.status === 'error' || page.status === 'error') {
    return <AccessDeniedState />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <ProjectsListSection
        clientId={clientId}
        projects={page.projects}
        selectedProject={page.selectedProject}
      />
      <ProjectDetailSection project={page.selectedProject} />
    </div>
  )
}
