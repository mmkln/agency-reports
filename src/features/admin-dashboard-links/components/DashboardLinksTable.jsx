import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  ConfirmationDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  PrimitiveCard as Card,
  StatusBadge,
  Table,
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
      <Card className="border-control-border bg-block py-0 shadow-none">
        <Table className="min-w-[1080px]">
          <TableHeader className="border-b border-control-border bg-surface-subtle text-xs font-semibold tracking-wide text-text-muted uppercase">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-3">Dashboard</TableHead>
              <TableHead className="px-6 py-3">Client</TableHead>
              <TableHead className="px-6 py-3">Provider</TableHead>
              <TableHead className="px-6 py-3">Status</TableHead>
              <TableHead className="px-6 py-3">Visibility</TableHead>
              <TableHead className="px-6 py-3">Last Checked</TableHead>
              <TableHead className="px-6 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-separator">
            {dashboardLinks.map((dashboardLink) => {
              const isClientVisible = dashboardLink.visibility === VISIBILITY.CLIENT_VISIBLE

              return (
                <TableRow className="transition-colors hover:bg-block-subtle" key={dashboardLink.id}>
                  <TableCell className="px-6 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-text-primary">{dashboardLink.name}</p>
                        {dashboardLink.showOnOverview ? (
                          <span className="rounded-full bg-action-muted px-2 py-0.5 text-xs font-medium text-action">
                            Overview
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 max-w-md truncate text-xs text-text-muted">
                        {dashboardLink.publicUrl || dashboardLink.embedUrl || 'No URL saved yet'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="font-medium text-text-secondary">{dashboardLink.client.name}</p>
                    <p className="mt-0.5 text-xs text-text-muted">/{dashboardLink.client.portalSlug}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-text-secondary">
                    {dashboardLink.providerMeta.label}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <StatusBadge meta={dashboardLink.statusMeta} />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <StatusBadge
                      icon={isClientVisible ? 'user' : 'lock'}
                      label={isClientVisible ? 'Client visible' : 'Internal'}
                      tone={isClientVisible ? 'blue' : 'neutral'}
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-text-muted">
                    {formatDate(dashboardLink.lastCheckedAt)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {dashboardLink.publicUrl ? (
                        <Button asChild size="icon-sm" title="Open full dashboard" variant="ghost">
                          <a href={dashboardLink.publicUrl} rel="noreferrer" target="_blank">
                            <Icon name="arrowUpRight" size={15} />
                          </a>
                        </Button>
                      ) : null}
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/client-dashboard-preview?clientId=${dashboardLink.clientId}&dashboardId=${dashboardLink.id}`}>
                          Preview
                        </Link>
                      </Button>
                      <Button onClick={() => onEditDashboardLink(dashboardLink)} size="sm" type="button" variant="ghost">
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-label="Dashboard actions" size="icon-sm" type="button" variant="ghost">
                            <Icon name="ellipsis" size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-56">
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
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

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
