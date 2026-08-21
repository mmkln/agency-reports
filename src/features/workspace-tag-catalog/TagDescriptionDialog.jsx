import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from '@/shared/ui'

const MAX_DESCRIPTION_LENGTH = 500

export function TagDescriptionDialog({
  draft,
  error,
  onChange,
  onClose,
  onSave,
  saveStatus,
  tag,
}) {
  const isSaving = saveStatus === 'saving'

  function handleSubmit(event) {
    event.preventDefault()
    onSave()
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={Boolean(tag)}
    >
      <DialogContent>
        <form className="grid gap-component" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit tag description</DialogTitle>
            <DialogDescription>{tag?.name ?? ''}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-item">
            <Label htmlFor="tag-description">Description</Label>
            <Textarea
              autoFocus
              className="resize-none"
              id="tag-description"
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={(event) => onChange(event.target.value)}
              placeholder="What this tag does and where it is used"
              value={draft}
            />
            {error ? <p className="text-label text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
