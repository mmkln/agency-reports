import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { Icon } from '@/shared/icons'
import { Link } from 'react-router-dom'

import { getAgencyClientDetailPath } from '@/domain/navigation/routePaths'

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
          <>
            <DropdownMenuItem asChild>
              <Link to={getAgencyClientDetailPath(client.id)}>
                <Icon name="users" size={15} />
                Open client
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenClient(client)}>
              <Icon name="fileText" size={15} />
              View details
            </DropdownMenuItem>
          </>
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
