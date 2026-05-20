import { useState } from 'react'

import {
  Button,
  Panel,
  PanelBody,
  PanelHeader,
  Switch,
} from '@/shared/ui'

import {
  getOwnNotificationPreferences,
  updateOwnNotificationPreferences,
} from '../../domain/services/accountNotificationService'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'

const preferenceRows = Object.freeze([
  {
    description: 'Notify me when the agency needs my approval, files, access, or feedback.',
    id: 'actionNeeded',
    label: 'Action needed',
  },
  {
    description: 'Notify me when reports, requests, updates, or workspace changes are published.',
    id: 'emailUpdates',
    label: 'Email updates',
  },
  {
    description: 'Send a weekly digest of open items and recent workspace changes.',
    id: 'weeklySummary',
    label: 'Weekly summary',
  },
])

function PreferenceRow({ description, id, isChecked, label, onChange }) {
  return (
    <div className="flex items-start justify-between gap-card rounded-control bg-block-subtle p-card">
      <label className="min-w-0" htmlFor={`notification-${id}`}>
        <span className="block text-ui font-semibold text-text-primary">{label}</span>
        <span className="mt-tag block max-w-readable text-body text-text-muted">{description}</span>
      </label>
      <Switch
        checked={isChecked}
        id={`notification-${id}`}
        onCheckedChange={onChange}
      />
    </div>
  )
}

export function AccountNotificationSettings({ runtime }) {
  const toast = useToast()
  const preferencesResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:account-notification-preferences`,
    load: () => runtime.dataClient.read((repositories) => getOwnNotificationPreferences({
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')
  const preferences = preferencesResource.data
  const currentDraft = draft ?? preferences

  const hasChanges = Boolean(
    currentDraft
    && preferences
    && preferenceRows.some((row) => currentDraft[row.id] !== preferences[row.id]),
  )

  function updatePreference(preferenceId, isChecked) {
    setError('')
    setStatus('idle')
    setDraft((currentDraft) => ({
      ...(currentDraft ?? preferences),
      [preferenceId]: isChecked,
    }))
  }

  function savePreferences(event) {
    event.preventDefault()

    if (!currentDraft || !hasChanges || status === 'saving') {
      return
    }

    setStatus('saving')
    void runtime.dataClient.write((repositories) => updateOwnNotificationPreferences({
      input: currentDraft,
      repositories,
      viewer: runtime.viewer,
    })).then((updatedPreferences) => {
      setDraft(updatedPreferences)
      setStatus('saved')
      void preferencesResource.reload()
      toast.success('Notification preferences saved', 'Your account notification settings were updated.')
    }).catch((caughtError) => {
      setError(caughtError.message)
      setStatus('idle')
      toast.error('Notification preferences were not saved', caughtError.message)
    })
  }

  if (preferencesResource.status === 'loading' || !currentDraft) {
    return (
      <Panel>
        <PanelHeader divided subtitle="Choose account-level notification defaults." title="Notifications" />
        <PanelBody className="min-h-[180px] animate-pulse" />
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader
        divided
        subtitle="Choose account-level notification defaults."
        title="Notifications"
      />
      <PanelBody>
        <form className="grid gap-component" onSubmit={savePreferences}>
          <div className="grid gap-control">
            {preferenceRows.map((row) => (
              <PreferenceRow
                description={row.description}
                id={row.id}
                isChecked={Boolean(currentDraft[row.id])}
                key={row.id}
                label={row.label}
                onChange={(isChecked) => updatePreference(row.id, isChecked)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-control">
            {status === 'saved' ? <span className="text-label text-success">Saved</span> : <span />}
            <Button disabled={!hasChanges || status === 'saving'} type="submit">
              {status === 'saving' ? 'Saving...' : 'Save notifications'}
            </Button>
          </div>
          {error ? <p className="text-label text-destructive" role="alert">{error}</p> : null}
        </form>
      </PanelBody>
    </Panel>
  )
}
