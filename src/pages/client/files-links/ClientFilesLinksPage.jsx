import { getClientFilesLinksPage } from '../../../domain/services/clientFilesLinksService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Panel, PanelBody } from '@/shared/ui'
import { AccessDeniedState } from '../../../widgets/client-overview'
import {
  FilesLinksLibrary,
  FilesLinksSummary,
} from '../../../widgets/client-files-links'

export function ClientFilesLinksPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-files-links:${clientId}:${routeParams.projectId ?? ''}`,
    load: () => runtime.dataClient.read((repositories) => getClientFilesLinksPage({
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
    <div className="grid gap-6">
      <FilesLinksSummary counts={page.counts} />
      <FilesLinksLibrary counts={page.counts} fileLinks={page.fileLinks} />
    </div>
  )
}
