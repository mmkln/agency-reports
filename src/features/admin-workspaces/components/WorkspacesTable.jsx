import { Link } from 'react-router-dom'

import { getDefaultWorkspaceAdminPath } from '@/features/admin-client-workspace'
import { WORKSPACE_STATUS_META } from '@/entities/workspace'
import {
  Button,
  ErrorBlock,
  Panel,
  PanelBody,
  PanelHeader,
  Table,
  TableActionCell,
  TableActionHead,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  StatusBadge,
} from '@/shared/ui'

export function WorkspacesTable({
  error,
  selectedClient,
  status,
  workspaces,
}) {
  return (
    <Panel>
      <PanelHeader
        action={selectedClient ? (
          <Button asChild size="sm" variant="ghost">
            <Link to="/admin/workspaces">Show all</Link>
          </Button>
        ) : null}
        divided
        title={selectedClient ? `${selectedClient.name} workspaces` : 'Workspaces'}
      />
      <PanelBody className="overflow-x-auto p-0">
        {status === 'loading' ? (
          <div className="min-h-[220px] animate-pulse" />
        ) : status === 'error' ? (
          <div className="p-card">
            <ErrorBlock title="Workspaces could not be loaded">
              {error}
            </ErrorBlock>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableActionHead>Actions</TableActionHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell className="font-medium">{workspace.name}</TableCell>
                  <TableCell>{workspace.client_name || 'Unassigned'}</TableCell>
                  <TableCell>{workspace.type}</TableCell>
                  <TableCell>
                    <StatusBadge
                      meta={WORKSPACE_STATUS_META[workspace.status] ?? {
                        label: workspace.status || 'Unknown',
                        tone: 'neutral',
                      }}
                    />
                  </TableCell>
                  <TableActionCell>
                    <Button asChild size="sm" variant="outline">
                      <Link to={getDefaultWorkspaceAdminPath(workspace)}>Open</Link>
                    </Button>
                  </TableActionCell>
                </TableRow>
              ))}
              {workspaces.length === 0 ? (
                <TableRow>
                  <TableCell className="text-text-muted" colSpan={5}>
                    No workspaces yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </PanelBody>
    </Panel>
  )
}
