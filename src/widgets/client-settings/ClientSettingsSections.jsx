import {
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
} from '@/shared/ui'

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-label text-text-muted">{label}</p>
      <p className="mt-1 text-ui text-text-primary">{value || 'Not set'}</p>
    </div>
  )
}

export function ProfileSettingsSection({ membership, profile }) {
  return (
    <Panel>
      <PanelHeader
        subtitle="Your portal identity and client access role."
        title="Profile"
      />
      <PanelBody className="grid gap-4 p-5 sm:grid-cols-3">
        <DetailItem label="Name" value={profile.name} />
        <DetailItem label="Email" value={profile.email} />
        <DetailItem label="Portal role" value={membership?.roleLabel ?? profile.roleLabel} />
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
      <PanelBody className="grid gap-4 p-5 sm:grid-cols-2">
        <DetailItem label="Client" value={client.name} />
        <DetailItem label="Portal slug" value={client.portalSlug} />
        <DetailItem label="Primary contact" value={client.primaryContactName} />
        <DetailItem label="Primary contact email" value={client.primaryContactEmail} />
      </PanelBody>
    </Panel>
  )
}

export function TeamMembersSection({ members }) {
  return (
    <Panel>
      <PanelHeader
        subtitle="People with access to this client portal."
        title="Team Members"
      />
      <PanelBody className="grid gap-3">
        {members.length ? (
          members.map((member) => (
            <article className="rounded-control border border-control-border bg-block-subtle p-4" key={member.id}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-ui text-text-primary">{member.name}</p>
                  <p className="mt-1 text-label font-normal text-text-muted">{member.email}</p>
                </div>
                <span className="w-fit rounded-control bg-control px-2 py-1 text-label text-text-secondary">
                  {member.roleLabel}
                </span>
              </div>
            </article>
          ))
        ) : (
          <EmptyState
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
        <EmptyState
          description={section.message}
          iconName={iconName}
          title={`${title} unavailable`}
        />
      </PanelBody>
    </Panel>
  )
}
