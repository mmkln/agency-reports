import { Link } from 'react-router-dom'

import { WORKSPACE_TYPE_META } from '@/entities/workspace'
import { getDefaultWorkspaceAdminPath } from '@/features/admin-client-workspace'
import { Icon } from '@/shared/icons'
import {
  Badge,
  Button,
  StatusBadge,
} from '@/shared/ui'

import { getWorkspaceStatusMeta } from '../model/clientDetailPresentation'

function WorkspaceListItem({ showOpenAction, workspace }) {
  const typeMeta = WORKSPACE_TYPE_META[workspace.type]

  return (
    <div className="flex flex-col gap-control rounded-control px-control py-control sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-tag">
        <h3 className="m-0 truncate text-ui font-semibold text-text-primary">{workspace.name}</h3>
        <div className="flex flex-wrap items-center gap-tag">
          <Badge tone={typeMeta?.tone ?? 'neutral'}>
            {typeMeta?.label ?? workspace.type}
          </Badge>
          <StatusBadge meta={getWorkspaceStatusMeta(workspace)} />
        </div>
      </div>
      {showOpenAction ? (
        <Button asChild size="sm" variant="outline">
          <Link to={getDefaultWorkspaceAdminPath(workspace)}>
            <Icon name="arrowUpRight" size={16} />
            Open workspace
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

export function ClientWorkspacesPanel({ onAddWorkspace, workspaces }) {
  const hasWorkspaces = workspaces.length > 0

  return (
    <section className="grid gap-component rounded-block bg-block p-card">
      <div className="flex items-center justify-between gap-control">
        <h2 className="m-0 text-ui font-semibold text-text-primary">
          {workspaces.length > 1 ? 'Workspaces' : 'Workspace'}
        </h2>
      </div>
      <div className="grid gap-item">
        {hasWorkspaces ? (
          workspaces.map((workspace) => (
            <WorkspaceListItem
              key={workspace.id}
              showOpenAction={workspaces.length > 1}
              workspace={workspace}
            />
          ))
        ) : (
          <div className="flex flex-col gap-control rounded-control bg-block-subtle px-card py-component sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-tag">
              <h3 className="m-0 text-ui font-semibold text-text-primary">No workspace yet</h3>
              <p className="m-0 text-ui text-text-muted">
                Create a workspace to organize this client's portal, reports, and work.
              </p>
            </div>
            <Button icon={<Icon name="plus" size={16} />} onClick={onAddWorkspace} size="sm" type="button">
              Add workspace
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
