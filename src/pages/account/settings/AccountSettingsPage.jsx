import { getOwnProfileSettings } from '../../../domain/services/accountProfileService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { AccountSettingsWorkspace } from '../../../widgets/account-settings'
import {
  Panel,
  PanelBody,
  UnavailableState,
} from '@/shared/ui'

export function AccountSettingsPage({ onAuthChange, onSignOut, runtime }) {
  const profileResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:account-settings`,
    load: () => runtime.dataClient.read((repositories) => getOwnProfileSettings({
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const profile = profileResource.data

  if (profileResource.status === 'error') {
    return (
      <Panel className="min-h-[360px]">
        <PanelBody className="flex min-h-[360px] items-center justify-center">
          <UnavailableState
            className="bg-transparent p-0"
            description="Your account profile could not be loaded."
            iconName="user"
            title="Account unavailable"
          />
        </PanelBody>
      </Panel>
    )
  }

  if (profileResource.status === 'loading' || !profile) {
    return (
      <Panel>
        <PanelBody className="min-h-[260px] animate-pulse" />
      </Panel>
    )
  }

  return (
    <AccountSettingsWorkspace
      onAuthChange={onAuthChange}
      onSignOut={onSignOut}
      profile={profile}
      runtime={runtime}
    />
  )
}
