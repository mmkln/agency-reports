import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ReadOnlyField,
} from '@/shared/ui'
import { ClientMembershipRoleSelect } from '@/entities/client-membership'
import { FieldError } from '../../admin-client-workspace'

export function AccessMemberEditDialog({
  error,
  member,
  onOpenChange,
  onRoleChange,
  onSubmit,
  role,
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={Boolean(member)}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sheet-md gap-component p-panel">
        <DialogHeader className="pr-control-xl">
          <DialogTitle>Edit member</DialogTitle>
          <DialogDescription>
            Update this user's workspace access.
          </DialogDescription>
        </DialogHeader>
        {member ? (
          <form className="grid gap-component" onSubmit={onSubmit}>
            <div className="grid gap-control sm:grid-cols-2">
              <ReadOnlyField label="Name" value={member.name} />
              <ReadOnlyField label="Email" value={member.email} />
            </div>
            <label className="grid gap-1.5">
              <span className="text-label text-text-secondary">Role</span>
              <ClientMembershipRoleSelect
                className="bg-block"
                onValueChange={onRoleChange}
                value={role}
              />
            </label>
            <FieldError>{error}</FieldError>
            <div className="flex justify-end gap-control">
              <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">
                Save changes
              </Button>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
