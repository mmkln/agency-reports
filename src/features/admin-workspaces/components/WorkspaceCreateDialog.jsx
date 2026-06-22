import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ErrorBlock,
  Input,
  Select,
} from '@/shared/ui'

export function WorkspaceCreateDialog({
  clients,
  createStatus,
  error,
  form,
  isOpen,
  onClose,
  onSubmit,
  onUpdateForm,
}) {
  const hasClients = clients.length > 0

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      open={isOpen}
    >
      <DialogContent className="max-w-modal-md">
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            Create an operational workspace under a client when the work needs its own portal, data, or access scope.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-component" id="create-workspace-form" onSubmit={onSubmit}>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Client</span>
            <Select
              disabled={!hasClients}
              onChange={(event) => onUpdateForm({ clientId: event.target.value })}
              required
              value={form.clientId}
            >
              <option disabled={hasClients} value="">
                {hasClients ? 'Select client' : 'Create a client first'}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </Select>
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Workspace name</span>
            <Input
              autoFocus
              onChange={(event) => onUpdateForm({ name: event.target.value })}
              placeholder="Green Dental - Main Clinic"
              required
              value={form.name}
            />
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Workspace type</span>
            <Select onChange={(event) => onUpdateForm({ type: event.target.value })} value={form.type}>
              <option value="clinic">Clinic</option>
              <option value="generic">Generic</option>
            </Select>
          </label>
          {error ? (
            <ErrorBlock title="Workspace could not be created">
              {error}
            </ErrorBlock>
          ) : null}
          {!hasClients ? (
            <ErrorBlock title="Client is required">
              Add a client before creating a workspace.
            </ErrorBlock>
          ) : null}
        </form>
        <DialogFooter>
          <Button disabled={createStatus === 'creating'} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={!hasClients || createStatus === 'creating'} form="create-workspace-form" type="submit">
            {createStatus === 'creating' ? 'Creating...' : 'Create workspace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
