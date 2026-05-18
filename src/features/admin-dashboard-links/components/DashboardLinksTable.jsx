import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  ConfirmationDialog,
  DataTableSurface,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

import { DASHBOARD_LINK_STATUSES, DASHBOARD_LINK_STATUS_META } from '../../../entities/dashboard-link'
import { VISIBILITY } from '../../../entities/update'
import { Icon } from '../../../shared/icons'

function formatDate(date) {
  if (!date) {
    return 'Never'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function DashboardLinksTable({
  dashboardLinks,
  onDeleteDashboardLink,
  onEditDashboardLink,
  onUpdateStatus,
}) {
  const [dashboardLinkPendingDelete, setDashboardLinkPendingDelete] = useState(null)

  function confirmDeleteDashboardLink() {
    if (!dashboardLinkPendingDelete) {
      return
    }

    onDeleteDashboardLink(dashboardLinkPendingDelete.id)
    setDashboardLinkPendingDelete(null)
  }

  return (
    <>
      <DataTableSurface>
        <Table className="min-w-[1080px]">
          <TableHeader>
            <TableRow>
              <TableHead>Dashboard</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Last Checked</TableHead>
              <TableActionHead>Actions</TableActionHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboardLinks.map((dashboardLink) => {
              const isClientVisible = dashboardLink.visibility === VISIBILITY.CLIENT_VISIBLE

              return (
                <TableRow key={dashboardLink.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-text-primary">{dashboardLink.name}</p>
                        {dashboardLink.showOnOverview ? (
                          <span className="rounded-full bg-action-muted px-2 py-0.5 text-label text-action">
                            Overview
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 max-w-md truncate text-label font-normal text-text-muted">
                        {dashboardLink.publicUrl || dashboardLink.embedUrl || 'No URL saved yet'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-text-secondary">{dashboardLink.client.name}</p>
                    <p className="mt-0.5 text-label font-normal text-text-muted">/{dashboardLink.client.portalSlug}</p>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {dashboardLink.providerMeta.label}
                  </TableCell>
                  <TableCell>
                    <StatusBadge meta={dashboardLink.statusMeta} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      icon={isClientVisible ? 'user' : 'lock'}
                      label={isClientVisible ? 'Client visible' : 'Internal'}
                      tone={isClientVisible ? 'blue' : 'neutral'}
                    />
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {formatDate(dashboardLink.lastCheckedAt)}
                  </TableCell>
                  <TableActionCell>
                    <div className="flex justify-end gap-1.5">
                      <Button onClick={() => onEditDashboardLink(dashboardLink)} size="sm" type="button" variant="outline">
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-label="Dashboard actions" size="icon-sm" type="button" variant="ghost">
                            <Icon name="ellipsis" size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-56">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/client-dashboard-preview?clientId=${dashboardLink.clientId}&dashboardId=${dashboardLink.id}`}>
                              <Icon name="layoutDashboard" size={15} />
                              Preview dashboard
                            </Link>
                          </DropdownMenuItem>
                          {dashboardLink.publicUrl ? (
                            <DropdownMenuItem asChild>
                              <a href={dashboardLink.publicUrl} rel="noreferrer" target="_blank">
                                <Icon name="arrowUpRight" size={15} />
                                Open full dashboard
                              </a>
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          {[
                            DASHBOARD_LINK_STATUSES.ACTIVE,
                            DASHBOARD_LINK_STATUSES.UNAVAILABLE,
                            DASHBOARD_LINK_STATUSES.DRAFT,
                            DASHBOARD_LINK_STATUSES.ARCHIVED,
                          ].map((status) => (
                            <DropdownMenuItem
                              disabled={status === dashboardLink.status}
                              key={status}
                              onClick={() => onUpdateStatus(dashboardLink.id, status)}
                            >
                              <Icon name={DASHBOARD_LINK_STATUS_META[status]?.icon ?? 'circle'} size={15} />
                              <span>Set {DASHBOARD_LINK_STATUS_META[status]?.label ?? status}</span>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDashboardLinkPendingDelete(dashboardLink)}
                            variant="destructive"
                          >
                            <Icon name="close" size={15} />
                            Delete dashboard
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableActionCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </DataTableSurface>

      <ConfirmationDialog
        confirmLabel="Delete dashboard"
        description={
          dashboardLinkPendingDelete
            ? `This removes "${dashboardLinkPendingDelete.name}" from local demo data. Client users will no longer see this dashboard.`
            : ''
        }
        onConfirm={confirmDeleteDashboardLink}
        onOpenChange={(open) => {
          if (!open) {
            setDashboardLinkPendingDelete(null)
          }
        }}
        open={Boolean(dashboardLinkPendingDelete)}
        title="Delete dashboard link?"
        tone="destructive"
      />
    </>
  )
}
