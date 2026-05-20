import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AccountProfileSettings } from '@/features/account-profile-settings'
import { AccountNotificationSettings } from '@/features/account-notification-settings'
import { AccountSecuritySettings } from '@/features/account-security-settings'
import {
  Button,
  ConfirmationDialog,
  Label,
  Panel,
  PanelBody,
  PanelHeader,
  RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { useTheme } from '@/shared/theme'
import { deactivateOwnProfile } from '../../domain/services/accountLifecycleService'
import { clearAuthSession } from '../../domain/services/authService'
import { useToast } from '../../shared/notifications'

const THEME_OPTIONS = Object.freeze([
  {
    label: 'Light',
    value: 'light',
  },
  {
    label: 'Dark',
    value: 'dark',
  },
  {
    label: 'System',
    value: 'system',
  },
])

function AppearanceSettings() {
  const { resolvedTheme, setTheme, theme } = useTheme()

  return (
    <Panel>
      <PanelHeader
        divided
        subtitle="Control the appearance of your own workspace."
        title="Appearance"
      />
      <PanelBody>
        <div className="grid max-w-form gap-control">
          <Label htmlFor="account-theme-mode">Theme</Label>
          <RadixSelect onValueChange={setTheme} value={theme}>
            <SelectTrigger id="account-theme-mode">
              <SelectValue placeholder="Choose appearance" />
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </RadixSelect>
          <p className="text-body text-text-muted">
            Current interface is using {resolvedTheme === 'dark' ? 'dark' : 'light'} appearance.
          </p>
        </div>
      </PanelBody>
    </Panel>
  )
}

function DangerZoneSettings({ onAuthChange, runtime }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [status, setStatus] = useState('idle')

  function deactivateAccount() {
    if (status === 'deactivating') {
      return
    }

    setStatus('deactivating')
    void runtime.dataClient.write((repositories) => deactivateOwnProfile({
      repositories,
      viewer: runtime.viewer,
    })).then(() => {
      setIsConfirmOpen(false)
      clearAuthSession()
      onAuthChange?.()
      toast.info('Account deactivated', 'You have been signed out.')
      navigate('/login', { replace: true })
    }).catch((error) => {
      setStatus('idle')
      toast.error('Account was not deactivated', error.message)
    })
  }

  return (
    <Panel>
      <PanelHeader
        action={(
          <Button
            disabled={status === 'deactivating'}
            onClick={() => setIsConfirmOpen(true)}
            type="button"
            variant="destructive"
          >
            {status === 'deactivating' ? 'Deactivating...' : 'Deactivate account'}
          </Button>
        )}
        divided
        subtitle="Deactivate your sign-in profile without deleting workspace history."
        title="Danger zone"
      />
      <PanelBody>
        <p className="max-w-readable text-body text-text-muted">
          Deactivation signs you out and blocks future login for this profile. Workspace records, requests,
          approvals, and activity history are preserved.
        </p>
      </PanelBody>
      <ConfirmationDialog
        confirmLabel="Deactivate account"
        description="You will be signed out immediately. This does not delete client workspaces or historical records."
        isConfirming={status === 'deactivating'}
        onConfirm={deactivateAccount}
        onOpenChange={setIsConfirmOpen}
        open={isConfirmOpen}
        title="Deactivate your account?"
        tone="destructive"
      />
    </Panel>
  )
}

export function AccountSettingsWorkspace({ onAuthChange, profile, runtime }) {
  return (
    <div className="grid gap-card">
      <AccountProfileSettings
        onAuthChange={onAuthChange}
        profile={profile}
        runtime={runtime}
      />
      <AppearanceSettings />
      <AccountSecuritySettings runtime={runtime} />
      <AccountNotificationSettings runtime={runtime} />
      <DangerZoneSettings onAuthChange={onAuthChange} runtime={runtime} />
    </div>
  )
}
