import { useState } from 'react'

import {
  Badge,
  Button,
  Input,
  Panel,
  PanelBody,
  PanelHeader,
} from '@/shared/ui'

import { updateOwnProfileSettings } from '../../domain/services/accountProfileService'
import { useToast } from '../../shared/notifications'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function FieldError({ children }) {
  if (!children) {
    return null
  }

  return (
    <p className="text-label text-destructive" role="alert">
      {children}
    </p>
  )
}

function createProfileForm(profile) {
  return {
    email: profile.email ?? '',
    name: profile.name ?? '',
  }
}

export function AccountProfileSettings({
  onAuthChange,
  profile,
  roleLabel,
  roleLabelTitle = 'Account role',
  runtime,
  subtitle = 'Your account identity and sign-in email.',
  title = 'Profile',
}) {
  const toast = useToast()
  const [savedProfile, setSavedProfile] = useState(profile)
  const [form, setForm] = useState(() => createProfileForm(profile))
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')

  const trimmedName = form.name.trim()
  const trimmedEmail = form.email.trim()
  const nameIssue = form.name && trimmedName.length < 2
    ? 'Enter at least 2 characters.'
    : ''
  const emailIssue = form.email && !EMAIL_PATTERN.test(trimmedEmail)
    ? 'Enter a valid email address.'
    : ''
  const hasChanges = (
    trimmedName !== (savedProfile.name ?? '')
    || trimmedEmail.toLowerCase() !== String(savedProfile.email ?? '').toLowerCase()
  )
  const canSave = Boolean(
    trimmedName
    && trimmedEmail
    && !nameIssue
    && !emailIssue
    && hasChanges
    && status !== 'saving',
  )

  function updateForm(fieldName, value) {
    setError('')
    setStatus('idle')
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
  }

  function resetForm() {
    setError('')
    setStatus('idle')
    setForm(createProfileForm(savedProfile))
  }

  function saveProfile(event) {
    event.preventDefault()

    if (!canSave) {
      return
    }

    setStatus('saving')

    void runtime.dataClient.write((repositories) => updateOwnProfileSettings({
      input: form,
      repositories,
      viewer: runtime.viewer,
    })).then((updatedProfile) => {
      setSavedProfile(updatedProfile)
      setForm(createProfileForm(updatedProfile))
      setStatus('saved')
      onAuthChange?.()
      toast.success('Profile updated', 'Your name and email were saved.')
    }).catch((caughtError) => {
      setError(caughtError.message)
      setStatus('idle')
      toast.error('Profile was not updated', caughtError.message)
    })
  }

  return (
    <Panel>
      <PanelHeader
        divided
        subtitle={subtitle}
        title={title}
      />
      <PanelBody>
        <form className="grid gap-component" onSubmit={saveProfile}>
          <div className="grid gap-control sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-label text-text-secondary">Name</span>
              <Input
                aria-invalid={Boolean(nameIssue)}
                autoComplete="name"
                onChange={(event) => updateForm('name', event.target.value)}
                required
                value={form.name}
              />
              <FieldError>{nameIssue}</FieldError>
            </label>
            <label className="grid gap-1.5">
              <span className="text-label text-text-secondary">Email</span>
              <Input
                aria-invalid={Boolean(emailIssue)}
                autoComplete="email"
                inputMode="email"
                onChange={(event) => updateForm('email', event.target.value)}
                required
                type="email"
                value={form.email}
              />
              <FieldError>{emailIssue}</FieldError>
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-control">
            <div className="flex items-center gap-control">
              <span className="text-label text-text-secondary">{roleLabelTitle}</span>
              <Badge tone="blue">{roleLabel ?? savedProfile.roleLabel}</Badge>
            </div>
            <div className="flex items-center gap-control">
              {status === 'saved' ? (
                <span className="text-label text-success">Saved</span>
              ) : null}
              <Button disabled={!hasChanges || status === 'saving'} onClick={resetForm} type="button" variant="outline">
                Reset
              </Button>
              <Button disabled={!canSave} type="submit">
                {status === 'saving' ? 'Saving...' : 'Save profile'}
              </Button>
            </div>
          </div>
          <FieldError>{error}</FieldError>
        </form>
      </PanelBody>
    </Panel>
  )
}
