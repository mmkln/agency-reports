import {
  PageShell,
  Panel,
  PanelBody,
  PanelHeader,
} from '@/shared/ui'

import {
  AdminClientWorkspaceHeader,
  WorkspaceState,
} from '../../admin-client-workspace'

const sourceRows = [
  {
    affected: 'Leads, replies, bookings, pipeline',
    name: 'GHL',
    status: 'Connected',
    sync: 'Synced 4h ago',
    tone: 'success',
  },
  {
    affected: 'Attendance, confirmations, calendar utilization',
    name: 'Weave',
    status: 'Connected',
    sync: 'Synced yesterday',
    tone: 'success',
  },
  {
    affected: 'Treatment acceptance, revenue assumptions',
    name: 'Dentrix',
    status: 'Connected',
    sync: 'Synced yesterday',
    tone: 'success',
  },
  {
    affected: 'Spend, cost per lead, cost per booking',
    name: 'Meta Ads export',
    status: 'Needs update',
    sync: 'Synced 8d ago',
    tone: 'warning',
  },
]

const toneClasses = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
}

function DataSourceRow({ row }) {
  return (
    <div className="grid gap-control border-b border-separator py-control last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
      <div className="min-w-0">
        <p className="text-ui font-semibold text-text-primary">{row.name}</p>
        <p className="mt-1 text-label text-text-muted">{row.affected}</p>
      </div>
      <span className="text-label text-text-secondary">{row.sync}</span>
      <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-label font-medium ${toneClasses[row.tone]}`}>
        {row.status}
      </span>
    </div>
  )
}

function DataSourcesPanel() {
  return (
    <Panel>
      <PanelHeader
        iconName="database"
        subtitle="Webhook and API inputs that feed the client Growth Review calculation."
        title="Sources"
      />
      <PanelBody>
        <div>
          {sourceRows.map((row) => (
            <DataSourceRow key={row.name} row={row} />
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}

function ValidationPanel() {
  return (
    <Panel>
      <PanelHeader
        iconName="checkCircle2"
        subtitle="Keep source problems visible here, not on the client review unless they affect published metrics."
        title="Data Health"
      />
      <PanelBody>
        <div className="grid gap-control md:grid-cols-3">
          <div className="rounded-control bg-surface-subtle px-3 py-3">
            <p className="text-label text-text-muted">Mapped sources</p>
            <p className="mt-2 text-data text-text-primary">4 / 4</p>
          </div>
          <div className="rounded-control bg-surface-subtle px-3 py-3">
            <p className="text-label text-text-muted">Validation issues</p>
            <p className="mt-2 text-data text-text-primary">1</p>
          </div>
          <div className="rounded-control bg-surface-subtle px-3 py-3">
            <p className="text-label text-text-muted">Affected metrics</p>
            <p className="mt-2 text-data text-text-primary">3</p>
          </div>
        </div>
      </PanelBody>
    </Panel>
  )
}

function DataSourcesLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState />
    </PageShell>
  )
}

function DataSourcesErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState message={message || 'Data sources could not be loaded.'} status="error" />
    </PageShell>
  )
}

export function AdminClinicDataSourcesWorkspace({ clientResource }) {
  if (clientResource.status === 'loading') {
    return <DataSourcesLoadingState />
  }

  if (clientResource.status === 'error' || !clientResource.data) {
    return <DataSourcesErrorState message={clientResource.error || 'Client was not found.'} />
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        client={clientResource.data}
        currentPage="clinic-data-sources"
        eyebrow="Client workspace"
      />

      <PageShell className="px-app-gutter py-content-gutter" width="content">
        <div className="grid gap-card">
          <DataSourcesPanel />
          <ValidationPanel />
        </div>
      </PageShell>
    </>
  )
}
