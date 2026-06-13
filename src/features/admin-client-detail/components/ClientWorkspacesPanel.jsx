import { Link } from 'react-router-dom'

import { getDefaultWorkspaceAdminPath } from '@/features/admin-client-workspace'
import { Icon } from '@/shared/icons'
import {
  Button,
} from '@/shared/ui'

import { getWorkspaceStatusMeta } from '../model/clientDetailPresentation'

function WorkspaceListItem({ workspace }) {
  const statusMeta = getWorkspaceStatusMeta(workspace)
  const isActive = workspace.status === 'active'
  const statusClassName = 'text-text-secondary'
  const statusDotClassName = isActive ? 'bg-success' : 'bg-fill-secondary'

  return (
    <div className="flex flex-col gap-control rounded-control border border-control-border px-component py-control sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 sm:flex sm:items-center sm:gap-card">
        <h3 className="m-0 truncate text-ui font-semibold text-text-primary">{workspace.name}</h3>
        <div className="flex flex-wrap items-center gap-item text-ui text-text-muted">
          <span className={`inline-flex items-center gap-tag ${statusClassName}`}>
            <span className={`size-1.5 rounded-full ${statusDotClassName}`} aria-hidden="true" />
            {statusMeta.label}
          </span>
        </div>
      </div>
      <Link
        className="inline-flex items-center gap-tag text-ui font-medium text-link no-underline hover:text-link-hover"
        to={getDefaultWorkspaceAdminPath(workspace)}
      >
        Open
        <Icon name="arrowRight" size={16} />
      </Link>
    </div>
  )
}

export function ClientWorkspacesPanel({ onAddWorkspace, workspaces }) {
  const hasWorkspaces = workspaces.length > 0

  return (
    <section className="grid gap-control rounded-block bg-block p-component">
      <div className="flex items-center justify-between gap-control">
        <h2 className="m-0 text-ui font-semibold text-text-primary">
          {workspaces.length > 1 ? 'Workspaces' : 'Workspace'}
        </h2>
        {hasWorkspaces ? (
          <Button icon={<Icon name="plus" size={16} />} onClick={onAddWorkspace} size="sm" type="button" variant="outline">
            Add workspace
          </Button>
        ) : null}
      </div>
      <div className="grid gap-item">
        {hasWorkspaces ? (
          workspaces.map((workspace) => (
            <WorkspaceListItem
              key={workspace.id}
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
