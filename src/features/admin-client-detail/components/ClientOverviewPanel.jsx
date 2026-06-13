import { Panel, PanelBody, PanelHeader, PropertyGrid } from '@/shared/ui'

import { formatDetailDate, getClientStatusMeta } from '../model/clientDetailPresentation'

export function ClientOverviewPanel({ client }) {
  const statusMeta = getClientStatusMeta(client)

  return (
    <Panel>
      <PanelHeader divided iconName="users" title="Client overview" />
      <PanelBody>
        <PropertyGrid
          items={[
            { label: 'Status', value: statusMeta.label },
            { label: 'Created', value: formatDetailDate(client.createdAt) },
            { label: 'Updated', value: formatDetailDate(client.updatedAt) },
            { label: 'Workspaces', value: client.workspaceCount },
            { label: 'Client users', value: client.membershipCount },
          ]}
        />
      </PanelBody>
    </Panel>
  )
}
