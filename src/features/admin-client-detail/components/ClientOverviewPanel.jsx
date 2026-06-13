import { Panel, PanelBody, PanelHeader, PropertyGrid } from '@/shared/ui'

import { formatDetailDate, getPrimaryContact, getPrimaryWorkspace } from '../model/clientDetailPresentation'

export function ClientOverviewPanel({ client, memberships }) {
  const primaryContact = getPrimaryContact(memberships)
  const primaryWorkspace = getPrimaryWorkspace(client)

  return (
    <Panel>
      <PanelHeader divided iconName="users" title="Client overview" />
      <PanelBody>
        <PropertyGrid
          items={[
            { label: 'Primary contact', value: primaryContact?.name || primaryContact?.email || 'Not set' },
            { label: 'Primary email', value: primaryContact?.email || 'Not set' },
            { label: 'Portal workspace', value: primaryWorkspace?.name || 'Not set' },
            { label: 'Created', value: formatDetailDate(client.createdAt) },
            { label: 'Updated', value: formatDetailDate(client.updatedAt) },
          ]}
        />
      </PanelBody>
    </Panel>
  )
}
