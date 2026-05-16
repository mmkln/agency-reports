import { useId, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { cn } from '@/lib/utils'

import { CLIENT_STATUSES, CLIENT_STATUS_META } from '../../../entities/client'
import { Icon } from '../../../shared/icons'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isUploadedLogo(value) {
  return value.startsWith('data:image/')
}

function getLogoPreviewLabel(form) {
  if (form.logoFileName) {
    return form.logoFileName
  }

  if (form.logoUrl) {
    return isUploadedLogo(form.logoUrl) ? 'Uploaded image' : 'External logo URL'
  }

  return 'No logo selected'
}

function FormField({ children, error, hint, label, required = false }) {
  return (
    <div className="grid gap-2">
      <Label>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? (
        <span className="text-label text-destructive" role="alert">{error}</span>
      ) : hint ? (
        <span className="text-label font-normal text-text-muted">{hint}</span>
      ) : null}
    </div>
  )
}

function ModalSection({ children, className, iconName, title }) {
  return (
    <section className={cn('grid content-start gap-component', className)}>
      <div className="flex items-center gap-2">
        <Icon className="text-text-quaternary" name={iconName} size={16} />
        <h3 className="text-label font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function PortalSlugInput({ hint = 'Auto-generated from client name. You can edit it before creating the client.', onChange, slugIssue, value }) {
  return (
    <FormField
      error={slugIssue}
      hint={hint}
      label="Portal slug"
      required
    >
      <div className={`flex h-target overflow-hidden rounded-control border bg-control shadow-none focus-within:ring-3 ${
        slugIssue
          ? 'border-destructive/30 focus-within:border-destructive focus-within:ring-destructive/20'
          : 'border-control-border focus-within:border-action focus-within:ring-action/20'
      }`}>
        <span className="flex items-center border-r border-control-border bg-surface-subtle px-3 text-ui text-text-muted">
          agency.com/
        </span>
        <Input
          aria-invalid={Boolean(slugIssue)}
          className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          minLength={3}
          name="portalSlug"
          onChange={(event) => onChange(event.target.value)}
          onInput={(event) => {
            event.currentTarget.setCustomValidity('')
          }}
          onInvalid={(event) => {
            event.currentTarget.setCustomValidity(slugIssue)
          }}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          placeholder="green-dental-clinic"
          ref={(node) => {
            if (node) {
              node.setCustomValidity(slugIssue)
            }
          }}
          required
          type="text"
          value={value}
        />
      </div>
    </FormField>
  )
}

function StatusSelect({ onFieldChange, value }) {
  return (
    <FormField hint="Controls the client-facing project status shown in the portal." label="Project status" required>
      <Select onValueChange={(nextValue) => onFieldChange('status', nextValue)} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Select project status" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(CLIENT_STATUSES).map((status) => {
            const meta = CLIENT_STATUS_META[status]

            return (
              <SelectItem key={status} value={status}>
                <span className="inline-flex items-center gap-2">
                  <Icon name={meta.icon} size={15} />
                  {meta.label}
                </span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </FormField>
  )
}

function getShortTextIssue(value, fieldName) {
  if (!value) {
    return ''
  }

  return value.trim().length < 2 ? `${fieldName} must be at least 2 characters.` : ''
}

function getEmailIssue(value) {
  if (!value) {
    return ''
  }

  return EMAIL_PATTERN.test(value.trim()) ? '' : 'Enter a valid email address.'
}

function LogoInput({ form, onFieldChange }) {
  const uploadInputId = useId()
  const [uploadInputKey, setUploadInputKey] = useState(0)
  const [uploadError, setUploadError] = useState('')

  function handleLogoUpload(event) {
    const [file] = event.target.files
    setUploadError('')

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Logo upload must be an image file.')
      event.target.value = ''
      return
    }

    if (file.size > 512 * 1024) {
      setUploadError('Logo upload must be 512 KB or smaller while local storage is used.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.addEventListener('load', () => {
      onFieldChange('logoFileName', file.name)
      onFieldChange('logoUrl', String(reader.result))
    })
    reader.readAsDataURL(file)
  }

  function removeUploadedLogo() {
    onFieldChange('logoFileName', '')
    onFieldChange('logoUrl', '')
    setUploadInputKey((currentKey) => currentKey + 1)
    setUploadError('')
  }

  return (
    <FormField hint="Optional. Upload a brand mark or use an external image URL." label="Logo">
      <div className="grid gap-component">
        <div className="grid gap-component sm:grid-cols-[auto_minmax(0,1fr)]">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control border border-control-border bg-surface-subtle text-text-quaternary">
            {form.logoUrl ? (
              <img alt="" className="h-full w-full object-cover" src={form.logoUrl} />
            ) : (
              <Icon name="fileText" size={16} />
            )}
          </span>

          <div className="grid min-w-0 content-start gap-item">
            <p className="text-ui text-text-primary">{getLogoPreviewLabel(form)}</p>
            <p className="text-label font-normal text-text-muted">Paste a logo URL or upload an image from this device.</p>
          </div>
        </div>

        <div className="flex h-target overflow-hidden rounded-control border border-control-border bg-control shadow-none transition-colors duration-motion-fast ease-motion-standard focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/35">
          <Input
            className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            inputMode="url"
            onChange={(event) => {
              setUploadError('')
              setUploadInputKey((currentKey) => currentKey + 1)
              onFieldChange('logoFileName', '')
              onFieldChange('logoUrl', event.target.value)
            }}
            placeholder="https://example.com/logo.png"
            type="url"
            value={isUploadedLogo(form.logoUrl) ? '' : form.logoUrl}
          />
          <Input
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="sr-only"
            id={uploadInputId}
            key={uploadInputKey}
            onChange={handleLogoUpload}
            type="file"
          />
          <label
            className="inline-flex h-full shrink-0 cursor-pointer items-center justify-center border-l border-control-border px-component text-ui font-medium text-text-secondary transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover hover:text-text-primary"
            htmlFor={uploadInputId}
          >
              Upload
          </label>
        </div>

        {form.logoUrl ? (
          <Button className="w-fit" onClick={removeUploadedLogo} size="sm" type="button" variant="outline">
            Remove logo
          </Button>
        ) : null}

        {uploadError ? (
          <p className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-ui text-destructive">
            {uploadError}
          </p>
        ) : null}
      </div>
    </FormField>
  )
}

export function CreateClientModal({
  error,
  form,
  isOpen,
  lastCreatedClient,
  mode = 'create',
  onClose,
  onSubmit,
  onUpdateField,
  slugIssue,
}) {
  const clientNameIssue = getShortTextIssue(form.name, 'Client name')
  const contactNameIssue = getShortTextIssue(form.primaryContactName, 'Contact name')
  const contactEmailIssue = getEmailIssue(form.primaryContactEmail)
  const isEditMode = mode === 'edit'

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-lg gap-0 overflow-hidden p-0">
        <form className="grid max-h-overlay min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]" onSubmit={onSubmit}>
          <OverlayHeader className="pr-control-xl">
            <DialogHeader>
              <DialogTitle className="text-heading text-text-primary">
                {isEditMode ? 'Edit Client' : 'Create Client'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? 'Update the client workspace, portal slug, contact, and project status.'
                  : 'Create a client workspace and first portal invite.'}
              </DialogDescription>
            </DialogHeader>
          </OverlayHeader>

          <OverlayBody className="min-h-0 overflow-y-auto">
            <div className="grid gap-card lg:grid-cols-2 lg:items-start">
              <ModalSection iconName="grid" title="Client Workspace">
                <FormField error={clientNameIssue} label="Client name" required>
                  <Input
                    aria-invalid={Boolean(clientNameIssue)}
                    minLength={2}
                    onChange={(event) => onUpdateField('name', event.target.value)}
                    placeholder="e.g. Green Dental Clinic"
                    required
                    type="text"
                    value={form.name}
                  />
                </FormField>
                <PortalSlugInput
                  hint={isEditMode
                    ? 'Used for the client portal URL. Changing it updates future portal links.'
                    : undefined}
                  onChange={(value) => onUpdateField('portalSlug', value)}
                  slugIssue={slugIssue}
                  value={form.portalSlug}
                />
                <LogoInput form={form} onFieldChange={onUpdateField} />
              </ModalSection>

              <ModalSection iconName="users" title="Primary Contact">
                <FormField error={contactNameIssue} label="Contact name" required>
                  <Input
                    aria-invalid={Boolean(contactNameIssue)}
                    minLength={2}
                    onChange={(event) => onUpdateField('primaryContactName', event.target.value)}
                    placeholder="e.g. Sarah Johnson"
                    required
                    type="text"
                    value={form.primaryContactName}
                  />
                </FormField>
                <FormField error={contactEmailIssue} hint="Used for the first local portal invite." label="Contact email" required>
                  <Input
                    aria-invalid={Boolean(contactEmailIssue)}
                    inputMode="email"
                    onChange={(event) => onUpdateField('primaryContactEmail', event.target.value)}
                    placeholder="sarah@greendental.com"
                    required
                    type="email"
                    value={form.primaryContactEmail}
                  />
                </FormField>
              </ModalSection>

              {isEditMode ? (
                <ModalSection className="lg:col-span-2" iconName="barChart" title="Portal State">
                  <StatusSelect onFieldChange={onUpdateField} value={form.status} />
                </ModalSection>
              ) : null}
            </div>

            {error ? (
              <p className="mt-5 rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-ui text-destructive">
                {error}
              </p>
            ) : null}

            {!isEditMode && lastCreatedClient ? (
              <div className="mt-5 rounded-control border border-control-border bg-surface-subtle px-3 py-3 text-ui text-text-secondary">
                <p className="font-semibold text-text-primary">{lastCreatedClient.client.name} was created.</p>
                <p className="mt-1">
                  Configure the client overview in the editor. The local invite is ready for{' '}
                  {lastCreatedClient.invitation.email}; email delivery is still simulated.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/client-overview?clientId=${lastCreatedClient.client.id}`}>Open editor</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/client-access?clientId=${lastCreatedClient.client.id}`}>Manage access</Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </OverlayBody>

          <OverlayFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={onClose} size="lg" type="button" variant="outline">
              Cancel
            </Button>
            <Button size="lg" type="submit">
              {isEditMode ? 'Save Changes' : 'Create Client'}
            </Button>
          </OverlayFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
