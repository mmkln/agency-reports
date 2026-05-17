import { getClientOverviewPage } from '../../../domain/services/clientOverviewService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { PageHeader } from '@/shared/ui'
import { Icon } from '../../../shared/icons'

const statusToneClasses = {
  amber: 'bg-warning text-warning-foreground',
  blue: 'bg-action text-action',
  green: 'bg-success text-success-foreground',
  neutral: 'bg-text-muted text-text-secondary',
  purple: 'bg-premium-purple text-premium-purple',
  rose: 'bg-destructive text-destructive',
}

function ProjectStatusAction({ client }) {
  const toneClass = statusToneClasses[client.statusMeta.tone] ?? statusToneClasses.neutral
  const [dotClass, textClass] = toneClass.split(' ')

  return (
    <div className="flex items-center gap-2">
      <span className="text-ui text-text-muted">Project status:</span>
      {client.statusMeta.icon ? (
        <Icon className={textClass} name={client.statusMeta.icon} size={14} />
      ) : (
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      )}
      <span className={`text-ui ${textClass}`}>
        {client.statusMeta.label}
      </span>
    </div>
  )
}

export function ClientOverviewPageHeader({ activeRoute, routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const previewSource = routeParams.preview === 'draft' ? 'draft' : 'published'
  const overviewResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:overview-header:${clientId}:${previewSource}`,
    load: () => runtime.dataClient.read((repositories) => getClientOverviewPage({
      clientId,
      repositories,
      source: previewSource,
      viewer: runtime.viewer,
    })),
  })
  const overview = overviewResource.data

  if (overviewResource.status === 'loading' || !overview) {
    return <PageHeader title="Overview" width={activeRoute?.contentWidth} />
  }

  if (overviewResource.status === 'error' || overview.status === 'error') {
    return <PageHeader title="Access denied" width={activeRoute?.contentWidth} />
  }

  return (
    <PageHeader
      actions={<ProjectStatusAction client={overview.client} />}
      title={overview.client.name}
      width={activeRoute?.contentWidth}
    />
  )
}
