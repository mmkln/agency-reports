import { getClientSettingsPage } from '../../../domain/services/clientSettingsService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Panel, PanelBody } from '@/shared/ui'
import { AccessDeniedState } from '../../../widgets/client-overview'
import {
  CompanySettingsSection,
  ProfileSettingsSection,
  TeamMembersSection,
  UnavailableSettingsSection,
} from '../../../widgets/client-settings'

export function ClientSettingsPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-settings:${clientId}`,
    load: () => runtime.dataClient.read((repositories) => getClientSettingsPage({
      clientId,
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
      <ProfileSettingsSection membership={page.currentMembership} profile={page.profile} />
      <CompanySettingsSection client={page.client} />
      <TeamMembersSection members={page.members} />
      <div className="grid gap-6 lg:grid-cols-2">
        <UnavailableSettingsSection
          iconName="bell"
          section={page.sections.notifications}
          title="Notifications"
        />
        <UnavailableSettingsSection
          iconName="lock"
          section={page.sections.security}
          title="Security"
        />
      </div>
    </div>
  )
}
