import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { Icon } from '@/shared/icons'

export function ClientMoreMenu({
  client,
  onCreateWorkspace,
  onEditClient,
  onInviteClientUser,
  onOpenClient,
  permissions,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={`${client.name} actions`} size="icon-sm" type="button" variant="ghost">
          <Icon name="ellipsis" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {permissions.canOpenClient ? (
          <DropdownMenuItem onClick={() => onOpenClient(client)}>
            <Icon name="users" size={15} />
            Open client
          </DropdownMenuItem>
        ) : null}
        {permissions.canInviteClientUser ? (
          <DropdownMenuItem onClick={() => onInviteClientUser(client)}>
            <Icon name="mail" size={15} />
            Invite client user
          </DropdownMenuItem>
        ) : null}
        {permissions.canAddWorkspace ? (
          <DropdownMenuItem onClick={() => onCreateWorkspace(client)}>
            <Icon name="plus" size={15} />
            Add workspace
          </DropdownMenuItem>
        ) : null}
        {permissions.canEditClient ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEditClient(client)}>
              <Icon name="pencil" size={15} />
              Edit client
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
