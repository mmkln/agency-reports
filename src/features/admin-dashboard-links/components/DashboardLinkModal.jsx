import {
  Button,
  Checkbox,
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
  Textarea,
} from '@/shared/ui'

import {
  DASHBOARD_LINK_STATUSES,
  DASHBOARD_LINK_STATUS_META,
  DASHBOARD_PROVIDERS,
  DASHBOARD_PROVIDER_META,
} from '../../../entities/dashboard-link'
import { VISIBILITY } from '../../../entities/update'
import { Icon } from '../../../shared/icons'

export function DashboardLinkModal({
  clients,
  error,
  form,
  isOpen,
  mode = 'create',
  onClose,
  onSubmit,
  onUpdateField,
}) {
  const title = mode === 'edit' ? 'Edit dashboard link' : 'Add dashboard link'
  const hasClients = clients.length > 0

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
              <DialogTitle className="text-lg font-semibold text-text-primary">{title}</DialogTitle>
              <DialogDescription>
                Store the external dashboard link. The portal embeds or opens it, but does not calculate analytics.
              </DialogDescription>
            </DialogHeader>
          </OverlayHeader>

          <OverlayBody className="min-h-0 overflow-y-auto">
            <div className="grid gap-component">
              {!hasClients ? (
                <div className="rounded-control border border-warning/25 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
                  Create a client workspace before adding dashboard links.
                </div>
              ) : null}

              {error ? (
                <div className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="dashboard-client">Client *</Label>
                <Select
                  disabled={mode === 'edit' || !hasClients}
                  onValueChange={(value) => onUpdateField('clientId', value)}
                  value={form.clientId}
                >
                  <SelectTrigger id="dashboard-client">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dashboard-name">Dashboard name *</Label>
                <Input
                  id="dashboard-name"
                  onChange={(event) => onUpdateField('name', event.target.value)}
                  placeholder="Marketing Performance Dashboard"
                  required
                  value={form.name}
                />
              </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="dashboard-provider">Provider *</Label>
                <Select
                  onValueChange={(value) => onUpdateField('provider', value)}
                  value={form.provider}
                >
                  <SelectTrigger id="dashboard-provider">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DASHBOARD_PROVIDERS).map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {DASHBOARD_PROVIDER_META[provider]?.label ?? provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dashboard-status">Status *</Label>
                <Select
                  onValueChange={(value) => onUpdateField('status', value)}
                  value={form.status}
                >
                  <SelectTrigger id="dashboard-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DASHBOARD_LINK_STATUSES).map((status) => (
                      <SelectItem key={status} value={status}>
                        {DASHBOARD_LINK_STATUS_META[status]?.label ?? status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dashboard-embed-url">Embed URL</Label>
              <Input
                id="dashboard-embed-url"
                onChange={(event) => onUpdateField('embedUrl', event.target.value)}
                placeholder="https://lookerstudio.google.com/embed/reporting/..."
                type="url"
                value={form.embedUrl}
              />
              <p className="text-xs leading-5 text-text-muted">
                Used for the iframe. If missing, the client will only see the full dashboard link.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dashboard-public-url">Public URL</Label>
              <Input
                id="dashboard-public-url"
                onChange={(event) => onUpdateField('publicUrl', event.target.value)}
                placeholder="https://lookerstudio.google.com/reporting/..."
                type="url"
                value={form.publicUrl}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dashboard-description">Description</Label>
              <Textarea
                id="dashboard-description"
                onChange={(event) => onUpdateField('description', event.target.value)}
                placeholder="Short client-facing context for what this dashboard contains."
                value={form.description}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dashboard-fallback">Fallback message</Label>
              <Textarea
                id="dashboard-fallback"
                onChange={(event) => onUpdateField('fallbackMessage', event.target.value)}
                placeholder="Dashboard is temporarily unavailable. The latest monthly summary is still available below."
                value={form.fallbackMessage}
              />
            </div>

            <div className="grid gap-3 rounded-control bg-surface-subtle p-3">
              <label className="flex items-start gap-3 text-sm text-text-secondary">
                <Checkbox
                  checked={form.visibility === VISIBILITY.CLIENT_VISIBLE}
                  onCheckedChange={(checked) => onUpdateField(
                    'visibility',
                    checked ? VISIBILITY.CLIENT_VISIBLE : VISIBILITY.INTERNAL,
                  )}
                />
                <span>
                  <span className="block font-medium text-text-primary">Client visible</span>
                  <span className="block text-xs leading-5 text-text-muted">
                    Draft and archived dashboards remain hidden from clients even when this is enabled.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm text-text-secondary">
                <Checkbox
                  checked={form.showOnOverview}
                  onCheckedChange={(checked) => onUpdateField('showOnOverview', Boolean(checked))}
                />
                <span>
                  <span className="block font-medium text-text-primary">Show on client overview</span>
                  <span className="block text-xs leading-5 text-text-muted">
                    This becomes the primary dashboard block for the client status hub.
                  </span>
                </span>
              </label>
            </div>
          </div>
          </OverlayBody>

          <OverlayFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={!hasClients} type="submit">
              <Icon name="checkCircle2" size={15} />
              {mode === 'edit' ? 'Save dashboard' : 'Create dashboard'}
            </Button>
          </OverlayFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
