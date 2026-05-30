import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  ConfirmationDialog,
  ErrorBlock,
  Input,
  Panel,
  PanelBody,
  PanelHeader,
  UnavailableState,
} from '@/shared/ui'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function createProfileForm(profile) {
  return {
    email: profile?.email ?? '',
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
  }
}

function FieldError({ children }) {
  if (!children) {
    return null
  }

  return <p className="text-label text-destructive">{children}</p>
}

export function AccountSettingsPage({ onAuthChange, onSignOut, runtime }) {
  const apiClient = runtime.apiClient
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(() => createProfileForm(null))
  const [error, setError] = useState('')
  const [status, setStatus] = useState('loading')
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)
  const [deactivateStatus, setDeactivateStatus] = useState('idle')

  useEffect(() => {
    let isActive = true

    apiClient.get('/api/auth/profile/')
      .then((payload) => {
        if (!isActive) {
          return
        }

        const nextProfile = payload.profile
        setProfile(nextProfile)
        setForm(createProfileForm(nextProfile))
        setStatus('ready')
      })
      .catch((caughtError) => {
        if (!isActive) {
          return
        }

        setError(caughtError.message)
        setStatus('error')
      })

    return () => {
      isActive = false
    }
  }, [apiClient])

  const nameIssue = !form.first_name.trim() ? 'First name is required.' : ''
  const emailIssue = !EMAIL_PATTERN.test(form.email.trim()) ? 'Enter a valid email address.' : ''
  const hasChanges = Boolean(profile) && (
    form.email.trim().toLowerCase() !== String(profile.email ?? '').toLowerCase()
    || form.first_name.trim() !== String(profile.first_name ?? '')
    || form.last_name.trim() !== String(profile.last_name ?? '')
  )
  const canSave = status !== 'saving' && hasChanges && !nameIssue && !emailIssue

  function updateField(field, value) {
    setError('')
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function saveProfile(event) {
    event.preventDefault()

    if (!canSave) {
      return
    }

    setStatus('saving')
    apiClient.request('/api/auth/profile/', {
      body: {
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      },
      method: 'PATCH',
    }).then((payload) => {
      const nextProfile = payload.profile
      setProfile(nextProfile)
      setForm(createProfileForm(nextProfile))
      setStatus('ready')
      onAuthChange?.()
    }).catch((caughtError) => {
      setError(caughtError.message)
      setStatus('ready')
    })
  }

  function deactivateAccount() {
    setDeactivateStatus('deactivating')
    apiClient.post('/api/auth/deactivate/', {})
      .then(() => {
        setIsDeactivateOpen(false)
        onSignOut?.()
        navigate('/login', { replace: true })
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setDeactivateStatus('idle')
      })
  }

  if (status === 'loading') {
    return (
      <Panel>
        <PanelBody className="min-h-[260px] animate-pulse" />
      </Panel>
    )
  }

  if (status === 'error') {
    return (
      <ErrorBlock title="Account settings could not be loaded">
        {error}
      </ErrorBlock>
    )
  }

  if (!profile) {
    return (
      <UnavailableState
        description="Your account profile is unavailable."
        iconName="user"
        title="Account unavailable"
      />
    )
  }

  return (
    <div className="grid gap-card">
      <Panel>
        <PanelHeader
          divided
          subtitle="Your sign-in identity comes from the backend account profile."
          title="Profile"
        />
        <PanelBody>
          <form className="grid gap-component" onSubmit={saveProfile}>
            <div className="grid gap-control sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-label text-text-secondary">First name</span>
                <Input
                  autoComplete="given-name"
                  onChange={(event) => updateField('first_name', event.target.value)}
                  required
                  value={form.first_name}
                />
                <FieldError>{nameIssue}</FieldError>
              </label>
              <label className="grid gap-1.5">
                <span className="text-label text-text-secondary">Last name</span>
                <Input
                  autoComplete="family-name"
                  onChange={(event) => updateField('last_name', event.target.value)}
                  value={form.last_name}
                />
              </label>
            </div>
            <label className="grid max-w-form gap-1.5">
              <span className="text-label text-text-secondary">Email</span>
              <Input
                autoComplete="email"
                inputMode="email"
                onChange={(event) => updateField('email', event.target.value)}
                required
                type="email"
                value={form.email}
              />
              <FieldError>{emailIssue}</FieldError>
            </label>
            {error ? <FieldError>{error}</FieldError> : null}
            <div className="flex flex-wrap justify-end gap-control">
              <Button
                disabled={!hasChanges || status === 'saving'}
                onClick={() => setForm(createProfileForm(profile))}
                type="button"
                variant="outline"
              >
                Reset
              </Button>
              <Button disabled={!canSave} type="submit">
                {status === 'saving' ? 'Saving...' : 'Save profile'}
              </Button>
            </div>
          </form>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader
          action={(
            <Button
              onClick={() => setIsDeactivateOpen(true)}
              type="button"
              variant="destructive"
            >
              Deactivate account
            </Button>
          )}
          divided
          subtitle="Deactivate your user profile without deleting workspace history."
          title="Danger zone"
        />
        <PanelBody>
          <p className="max-w-readable text-body text-text-muted">
            You will be signed out immediately. Workspaces and historical records remain intact.
          </p>
        </PanelBody>
      </Panel>

      <ConfirmationDialog
        confirmLabel="Deactivate account"
        description="This disables your login profile and signs you out. It does not delete workspaces."
        isConfirming={deactivateStatus === 'deactivating'}
        onConfirm={deactivateAccount}
        onOpenChange={setIsDeactivateOpen}
        open={isDeactivateOpen}
        title="Deactivate your account?"
        tone="destructive"
      />
    </div>
  )
}
