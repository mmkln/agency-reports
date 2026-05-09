import { getClientOverview } from '../../../domain/services/clientOverviewService'
import { PageHeader } from '../../../shared/layout/PageHeader'

const statusToneClasses = {
  amber: 'bg-amber-500 text-amber-700',
  blue: 'bg-indigo-500 text-indigo-700',
  green: 'bg-emerald-500 text-emerald-700',
  neutral: 'bg-slate-400 text-slate-600',
  rose: 'bg-rose-500 text-rose-700',
}

function ProjectStatusAction({ client }) {
  const toneClass = statusToneClasses[client.statusMeta.tone] ?? statusToneClasses.neutral
  const [dotClass, textClass] = toneClass.split(' ')

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">Project status:</span>
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      <span className={`text-sm font-medium ${textClass}`}>
        {client.statusMeta.label}
      </span>
    </div>
  )
}

export function ClientOverviewPageHeader({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const overview = getClientOverview({
    clientId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

  if (overview.status === 'error') {
    return <PageHeader subtitle="Check the client link or contact your agency manager." title="Access denied" />
  }

  return (
    <PageHeader
      actions={<ProjectStatusAction client={overview.client} />}
      title={overview.client.name}
    />
  )
}
