import { Link } from 'react-router-dom'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { Icon } from '@/shared/icons'

import { getWorkspaceAdminPath } from '../model/adminClientPaths'

export function ClientWorkspaceAction({ client, onCreateWorkspace, permissions }) {
  const workspaces = client.workspaces ?? []

  if (workspaces.length === 0) {
    if (!permissions.canAddWorkspace) {
      return <span className="text-ui text-text-muted">No workspace</span>
    }

    return (
      <Button onClick={() => onCreateWorkspace(client)} size="sm" type="button" variant="outline">
        Add workspace
      </Button>
    )
  }

  if (workspaces.length === 1) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link to={getWorkspaceAdminPath(workspaces[0], client)}>Workspace</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button icon={<Icon name="chevronDown" size={14} />} size="sm" type="button" variant="outline">
          Workspaces
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-60">
        {workspaces.map((workspace) => (
          <DropdownMenuItem asChild key={workspace.id}>
            <Link to={getWorkspaceAdminPath(workspace, client)}>
              <Icon name="grid" size={15} />
              {workspace.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
