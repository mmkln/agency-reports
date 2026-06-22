import { useState } from 'react'

import {
  Button,
  Input,
  Panel,
  PanelBody,
  PanelHeader,
} from '@/shared/ui'

import { changeOwnPassword } from '../../domain/services/accountSecurityService'
import { useToast } from '../../shared/notifications'

function createUuid() {
  return crypto.randomUUID()
}

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

const initialForm = Object.freeze({
  confirmPassword: '',
  currentPassword: '',
  newPassword: '',
})

export function AccountSecuritySettings({ runtime }) {
  const toast = useToast()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')
  const canSubmit = Boolean(
    form.currentPassword
    && form.newPassword
    && form.confirmPassword
    && status !== 'saving',
  )

  function updateField(fieldName, value) {
    setError('')
    setStatus('idle')
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
  }

  function submitPasswordChange(event) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setStatus('saving')

    void runtime.dataClient.write((repositories) => changeOwnPassword({
      idGenerator: createUuid,
      input: form,
      repositories,
      viewer: runtime.viewer,
    })).then(() => {
      setForm(initialForm)
      setStatus('saved')
      toast.success('Password updated', 'Use your new password the next time you sign in.')
    }).catch((caughtError) => {
      setError(caughtError.message)
      setStatus('idle')
      toast.error('Password was not updated', caughtError.message)
    })
  }

  return (
    <Panel>
      <PanelHeader
        divided
        subtitle="Change the password used to sign in to this account."
        title="Security"
      />
      <PanelBody>
        <form className="grid max-w-form gap-component" onSubmit={submitPasswordChange}>
          <label className="grid gap-1.5">
            <span className="text-label text-text-secondary">Current password</span>
            <Input
              autoComplete="current-password"
              onChange={(event) => updateField('currentPassword', event.target.value)}
              required
              type="password"
              value={form.currentPassword}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-label text-text-secondary">New password</span>
            <Input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => updateField('newPassword', event.target.value)}
              required
              type="password"
              value={form.newPassword}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-label text-text-secondary">Confirm new password</span>
            <Input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              required
              type="password"
              value={form.confirmPassword}
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-control">
            {status === 'saved' ? (
              <span className="text-label text-success">Saved</span>
            ) : <span />}
            <Button disabled={!canSubmit} type="submit">
              {status === 'saving' ? 'Saving...' : 'Change password'}
            </Button>
          </div>
          <FieldError>{error}</FieldError>
        </form>
      </PanelBody>
    </Panel>
  )
}
