import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  ConfirmationDialog,
  DataTable,
  DataTableSurface,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  StatusBadge,
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
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      cell: ({ row }) => {
        const dashboardLink = row.original

        return (
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
        )
      },
      header: 'Dashboard',
      meta: {
        label: 'Dashboard',
        minWidthClassName: 'min-w-[260px]',
      },
    },
    {
      accessorKey: 'client.name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-secondary">{row.original.client.name}</p>
          <p className="mt-0.5 text-label font-normal text-text-muted">/{row.original.client.portalSlug}</p>
        </div>
      ),
      header: 'Account',
      sortingFn: (left, right) => (
        String(left.original.client.name ?? '').localeCompare(String(right.original.client.name ?? ''))
      ),
    },
    {
      accessorKey: 'providerMeta.label',
      cell: ({ row }) => row.original.providerMeta.label,
      header: 'Provider',
      meta: {
        cellClassName: 'text-text-secondary',
      },
    },
    {
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge meta={row.original.statusMeta} />,
      header: 'Status',
    },
    {
      accessorKey: 'visibility',
      cell: ({ row }) => {
        const isClientVisible = row.original.visibility === VISIBILITY.CLIENT_VISIBLE

        return (
          <StatusBadge
            icon={isClientVisible ? 'user' : 'lock'}
            label={isClientVisible ? 'Visible in portal' : 'Internal'}
            tone={isClientVisible ? 'blue' : 'neutral'}
          />
        )
      },
      header: 'Visibility',
    },
    {
      accessorKey: 'lastCheckedAt',
      cell: ({ row }) => formatDate(row.original.lastCheckedAt),
      header: 'Last Checked',
      meta: {
        cellClassName: 'text-text-muted',
      },
    },
    {
      cell: ({ row }) => {
        const dashboardLink = row.original

        return (
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
        )
      },
      enableSorting: false,
      header: 'Actions',
      id: 'actions',
      meta: {
        isAction: true,
        label: 'Actions',
        nowrap: true,
      },
    },
  ], [onEditDashboardLink, onUpdateStatus])

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
        <DataTable
          columns={columns}
          data={dashboardLinks}
          emptyMessage="No dashboards yet."
          getRowId={(dashboardLink) => dashboardLink.id}
        />
      </DataTableSurface>

      <ConfirmationDialog
        confirmLabel="Delete dashboard"
        description={
          dashboardLinkPendingDelete
            ? `This removes "${dashboardLinkPendingDelete.name}". Portal users will no longer see this dashboard.`
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
