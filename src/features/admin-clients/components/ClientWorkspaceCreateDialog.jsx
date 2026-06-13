import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ErrorBlock,
  Input,
} from '@/shared/ui'

export function ClientWorkspaceCreateDialog({
  client,
  error,
  form,
  isOpen,
  onClose,
  onSubmit,
  onUpdateForm,
  status,
}) {
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
        </DialogHeader>
        <form className="grid gap-component" id="create-client-workspace-form" onSubmit={onSubmit}>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Client</span>
            <Input disabled value={client?.name ?? ''} />
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Workspace name</span>
            <Input
              autoFocus
              onChange={(event) => onUpdateForm({ name: event.target.value })}
              placeholder="Main clinic"
              required
              value={form.name}
            />
          </label>
          {error ? (
            <ErrorBlock title="Workspace could not be created">
              {error}
            </ErrorBlock>
          ) : null}
        </form>
        <DialogFooter>
          <Button disabled={status === 'creating'} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={!client || status === 'creating'} form="create-client-workspace-form" type="submit">
            {status === 'creating' ? 'Creating...' : 'Create workspace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
