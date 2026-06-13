import { Link } from 'react-router-dom'

import { WORKSPACE_TYPE_META } from '@/entities/workspace'
import { getDefaultWorkspaceAdminPath } from '@/features/admin-client-workspace'
import { Icon } from '@/shared/icons'
import {
  Badge,
  Button,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
  Table,
  TableActionCell,
  TableActionHead,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

import { getWorkspaceStatusMeta } from '../model/clientDetailPresentation'

export function ClientWorkspacesPanel({ workspaces }) {
  return (
    <Panel>
      <PanelHeader divided iconName="grid" title="Workspaces" />
      <PanelBody className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableActionHead>Actions</TableActionHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workspaces.map((workspace) => {
              const typeMeta = WORKSPACE_TYPE_META[workspace.type]

              return (
                <TableRow key={workspace.id}>
                  <TableCell className="font-medium">{workspace.name}</TableCell>
                  <TableCell>
                    <Badge tone={typeMeta?.tone ?? 'neutral'}>
                      {typeMeta?.label ?? workspace.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge meta={getWorkspaceStatusMeta(workspace)} />
                  </TableCell>
                  <TableActionCell>
                    <Button asChild size="sm" variant="outline">
                      <Link to={getDefaultWorkspaceAdminPath(workspace)}>
                        <Icon name="arrowUpRight" size={16} />
                        Open workspace
                      </Link>
                    </Button>
                  </TableActionCell>
                </TableRow>
              )
            })}
            {workspaces.length === 0 ? (
              <TableRow>
                <TableCell className="text-text-muted" colSpan={4}>
                  No workspaces yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </PanelBody>
    </Panel>
  )
}
