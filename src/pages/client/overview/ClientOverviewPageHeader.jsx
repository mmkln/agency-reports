import { getClientOverview } from '../../../domain/services/clientOverviewService'
import { PageHeader } from '../../../shared/layout/PageHeader'
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
      <span className="text-sm text-text-muted">Project status:</span>
      {client.statusMeta.icon ? (
        <Icon className={textClass} name={client.statusMeta.icon} size={14} />
      ) : (
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      )}
      <span className={`text-sm font-medium ${textClass}`}>
        {client.statusMeta.label}
      </span>
    </div>
  )
}

export function ClientOverviewPageHeader({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const previewSource = routeParams.preview === 'draft' ? 'draft' : 'published'
  const overview = getClientOverview({
    clientId,
    repositories: runtime.repositories,
    source: previewSource,
    viewer: runtime.viewer,
  })

  if (overview.status === 'error') {
    return <PageHeader subtitle="Check the client link or contact your agency manager." title="Access denied" />
  }

  return (
    <PageHeader
      actions={<ProjectStatusAction client={overview.client} />}
      subtitle={previewSource === 'draft' ? 'Draft preview - not visible to the client until published.' : ''}
      title={overview.client.name}
    />
  )
}
