import {
  AvatarFallback,
  Badge,
  CodeValue,
  EmptyState,
  ListPanel,
  ListRow,
  Panel,
  PanelBody,
  PanelHeader,
  PropertyGrid,
  UnavailableState,
} from '@/shared/ui'

export function ProfileSettingsSection({ membership, profile }) {
  return (
    <Panel>
      <PanelHeader
        subtitle="Your portal identity and client access role."
        title="Profile"
      />
      <PanelBody>
        <PropertyGrid
          columns={3}
          items={[
            {
              label: 'Name',
              value: profile.name,
            },
            {
              label: 'Email',
              value: profile.email,
            },
            {
              label: 'Portal role',
              value: <Badge tone="blue">{membership?.roleLabel ?? profile.roleLabel}</Badge>,
            },
          ]}
        />
      </PanelBody>
    </Panel>
  )
}

export function CompanySettingsSection({ client }) {
  return (
    <Panel>
      <PanelHeader
        subtitle="The client workspace connected to your account."
        title="Company"
      />
      <PanelBody>
        <PropertyGrid
          columns={2}
          items={[
            {
              label: 'Client',
              value: client.name,
            },
            {
              label: 'Portal slug',
              value: <CodeValue>{client.portalSlug}</CodeValue>,
            },
            {
              label: 'Primary contact',
              value: client.primaryContactName,
            },
            {
              label: 'Primary contact email',
              value: client.primaryContactEmail,
            },
          ]}
        />
      </PanelBody>
    </Panel>
  )
}

export function TeamMembersSection({ members }) {
  return (
    <Panel>
      <PanelHeader
        divided
        subtitle="People with access to this client portal."
        title="Team Members"
      />
      <PanelBody className="p-0">
        {members.length ? (
          <ListPanel>
            {members.map((member) => (
              <ListRow
                description={member.email}
                key={member.id}
                leading={<AvatarFallback name={member.name} />}
                title={member.name}
                trailing={<Badge tone={member.role === 'owner' ? 'blue' : 'neutral'}>{member.roleLabel}</Badge>}
              />
            ))}
          </ListPanel>
        ) : (
          <EmptyState
            className="m-card"
            description="No members are currently attached to this client."
            iconName="users"
            title="No team members"
          />
        )}
      </PanelBody>
    </Panel>
  )
}

export function UnavailableSettingsSection({ iconName, section, title }) {
  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody>
        <UnavailableState
          description={section.message}
          iconName={iconName}
          title={`${title} unavailable`}
        />
      </PanelBody>
    </Panel>
  )
}
