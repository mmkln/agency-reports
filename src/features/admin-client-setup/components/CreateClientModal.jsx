import { Link } from 'react-router-dom'

import { ROUTE_PATHS, withSearchParams } from '@/domain/navigation/routePaths'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
} from '@/shared/ui'

import { CLIENT_TYPES } from '../../../entities/client'
import {
  getEmailIssue,
  getShortTextIssue,
} from '../model'
import {
  ClientTypeSelect,
  FormField,
  LogoInput,
  ModalSection,
  PortalSlugInput,
  StatusSelect,
} from './CreateClientModalFields'

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
                    ? 'Used for the portal URL. Changing it updates future portal links.'
                    : undefined}
                  onChange={(value) => onUpdateField('portalSlug', value)}
                  slugIssue={slugIssue}
                  value={form.portalSlug}
                />
                <LogoInput form={form} onFieldChange={onUpdateField} />
                <ClientTypeSelect onFieldChange={onUpdateField} value={form.type} />
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
                  Configure clinic setup and access. The local invite is ready for{' '}
                  {lastCreatedClient.invitation.email}; email delivery is still simulated.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lastCreatedClient.client.type === CLIENT_TYPES.CLINIC ? (
                    <Button asChild size="sm" variant="outline">
                      <Link to={withSearchParams(ROUTE_PATHS.agencyClinicSetup, {
                        clientId: lastCreatedClient.client.id,
                      })}
                      >
                        Setup
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild size="sm" variant="outline">
                    <Link to={withSearchParams(ROUTE_PATHS.agencyClientAccess, {
                      clientId: lastCreatedClient.client.id,
                    })}
                    >
                      Access
                    </Link>
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
