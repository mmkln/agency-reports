import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { CLIENT_STATUS_META } from '../../../entities/client'
import { Icon } from '../../../shared/icons'

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

function FormField({ children, hint, label, required = false }) {
  return (
    <div className="grid gap-2">
      <Label>
        {label}
        {required ? <span className="text-rose-500">*</span> : null}
      </Label>
      {children}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
  )
}

function DrawerSection({ children, iconName, title }) {
  return (
    <section className="grid gap-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Icon className="text-slate-400" name={iconName} size={16} />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function PortalSlugInput({ onChange, slugIssue, value }) {
  return (
    <FormField
      hint={slugIssue || 'Auto-generated from client name. You can edit it before creating the client.'}
      label="Portal slug"
      required
    >
      <div className={`flex h-10 overflow-hidden rounded-lg border bg-white shadow-xs focus-within:ring-3 ${
        slugIssue
          ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100'
          : 'border-slate-200 focus-within:border-indigo-400 focus-within:ring-indigo-100'
      }`}>
        <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
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

function LogoInput({ form, onFieldChange }) {
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
    setUploadError('')
  }

  return (
    <FormField hint="Upload an image or paste an external http(s) URL." label="Logo">
      <div className="grid gap-3">
        <div className="flex gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
            {form.logoUrl ? (
              <img alt="" className="h-full w-full object-cover" src={form.logoUrl} />
            ) : (
              <Icon name="fileText" size={16} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <Input
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="h-auto file:mr-3 file:h-8 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={handleLogoUpload}
              type="file"
            />
            <p className="mt-1 truncate text-xs text-slate-500">{getLogoPreviewLabel(form)}</p>
          </div>
        </div>
        <Input
          disabled={isUploadedLogo(form.logoUrl)}
          inputMode="url"
          onChange={(event) => {
            onFieldChange('logoFileName', '')
            onFieldChange('logoUrl', event.target.value)
          }}
          placeholder="https://example.com/logo.png"
          type="url"
          value={isUploadedLogo(form.logoUrl) ? '' : form.logoUrl}
        />
        {isUploadedLogo(form.logoUrl) ? (
          <Button onClick={removeUploadedLogo} size="sm" type="button" variant="outline">
            Remove uploaded logo
          </Button>
        ) : null}
        {uploadError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {uploadError}
          </p>
        ) : null}
      </div>
    </FormField>
  )
}

export function CreateClientDrawer({
  error,
  form,
  isOpen,
  lastCreatedClient,
  onClose,
  onSubmit,
  onUpdateField,
  slugIssue,
  statusOptions,
}) {
  return (
    <Sheet onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <SheetContent className="w-full max-w-[430px] gap-0 p-0 sm:max-w-[430px]" showCloseButton={false}>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          <SheetHeader className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SheetTitle className="text-lg font-semibold text-slate-900">Create Client</SheetTitle>
                <SheetDescription>Setup a new client portal workspace.</SheetDescription>
              </div>
              <Button onClick={onClose} size="icon-lg" type="button" variant="outline">
                <Icon name="close" size={16} />
              </Button>
            </div>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <DrawerSection iconName="grid" title="Client Workspace">
              <FormField label="Client name" required>
                <Input
                  minLength={2}
                  onChange={(event) => onUpdateField('name', event.target.value)}
                  placeholder="e.g. Green Dental Clinic"
                  required
                  type="text"
                  value={form.name}
                />
              </FormField>
              <PortalSlugInput
                onChange={(value) => onUpdateField('portalSlug', value)}
                slugIssue={slugIssue}
                value={form.portalSlug}
              />
              <LogoInput form={form} onFieldChange={onUpdateField} />
            </DrawerSection>

            <Separator className="my-6" />

            <DrawerSection iconName="users" title="Primary Contact">
              <FormField label="Contact name" required>
                <Input
                  minLength={2}
                  onChange={(event) => onUpdateField('primaryContactName', event.target.value)}
                  placeholder="e.g. Sarah Johnson"
                  required
                  type="text"
                  value={form.primaryContactName}
                />
              </FormField>
              <FormField hint="Needed for future portal invitations." label="Contact email" required>
                <Input
                  inputMode="email"
                  onChange={(event) => onUpdateField('primaryContactEmail', event.target.value)}
                  placeholder="sarah@greendental.com"
                  required
                  type="email"
                  value={form.primaryContactEmail}
                />
              </FormField>
            </DrawerSection>

            <Separator className="my-6" />

            <DrawerSection iconName="target" title="Initial Portal State">
              <FormField label="Project status" required>
                <Select onValueChange={(value) => onUpdateField('status', value)} required value={form.status}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select initial status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {CLIENT_STATUS_META[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <div className="flex gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-3 text-sm text-indigo-700">
                <Icon className="mt-0.5 shrink-0" name="helpCircle" size={16} />
                <p>
                  After creation, the client's overview will show an empty state until you add
                  projects, tasks, and reporting data.
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                A local invitation token will be generated immediately. Email delivery is still
                simulated until a real backend is connected.
              </div>
            </DrawerSection>

            {error ? (
              <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            {lastCreatedClient ? (
              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                <p className="font-semibold">{lastCreatedClient.client.name} was created.</p>
                <p className="mt-1">
                  Invite is ready for {lastCreatedClient.invitation.email}.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a href={`#admin-client-overview?clientId=${lastCreatedClient.client.id}`}>Open editor</a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`#accept-invite?token=${lastCreatedClient.invitation.token}`}>Open invite</a>
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <SheetFooter className="flex-row justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <Button onClick={onClose} size="lg" type="button" variant="outline">
              Cancel
            </Button>
            <Button size="lg" type="submit">
              Create Client
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
