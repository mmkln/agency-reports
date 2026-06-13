import { useCallback, useMemo, useState } from 'react'
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

import {
  PERFORMANCE_DASHBOARD_STATUSES,
  PERFORMANCE_DASHBOARD_STATUS_META,
} from '../../../entities/performance-dashboard'
import { Icon } from '../../../shared/icons'

const statusOrder = [
  PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
  PERFORMANCE_DASHBOARD_STATUSES.READY,
  PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
  PERFORMANCE_DASHBOARD_STATUSES.ARCHIVED,
]

function formatDate(date, options = {}) {
  if (!date) {
    return 'Not set'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(parsedDate)
}

function formatPeriod(period) {
  return `${formatDate(period.periodStart)} - ${formatDate(period.periodEnd)}`
}

function getHeroMetric(period) {
  const heroMetric = period.content?.hero_metric

  if (!heroMetric?.label && !heroMetric?.value) {
    return {
      label: 'Hero metric not set',
      value: 'Missing',
    }
  }

  return {
    label: heroMetric.label || 'Hero metric',
    value: `${heroMetric.value ?? ''}${heroMetric.unit ? ` ${heroMetric.unit}` : ''}`.trim(),
  }
}

function getStatusChangeCopy(period, nextStatus) {
  const nextStatusMeta = PERFORMANCE_DASHBOARD_STATUS_META[nextStatus] ?? {
    label: nextStatus,
  }

  if (nextStatus === PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED) {
    return {
      confirmLabel: 'Publish dashboard',
      description: `"${period.title}" will become visible to the client. Publish validation requires narrative, hero metric, KPI cards, insights, next steps, and freshness metadata.`,
      title: 'Publish performance dashboard?',
      tone: 'primary',
    }
  }

  if (period.status === PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED && nextStatus === PERFORMANCE_DASHBOARD_STATUSES.DRAFT) {
    return {
      confirmLabel: 'Move to draft',
      description: `"${period.title}" will be hidden from client users immediately.`,
      title: 'Move published dashboard to draft?',
      tone: 'destructive',
    }
  }

  if (period.status === PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED && nextStatus === PERFORMANCE_DASHBOARD_STATUSES.ARCHIVED) {
    return {
      confirmLabel: 'Archive dashboard',
      description: `"${period.title}" will remain visible as historical performance, but it will no longer be treated as the active period.`,
      title: 'Archive published dashboard?',
      tone: 'primary',
    }
  }

  return {
    confirmLabel: `Set ${nextStatusMeta.label}`,
    description: `"${period.title}" will be set to ${nextStatusMeta.label}.`,
    title: 'Change dashboard status?',
    tone: 'primary',
  }
}

export function PerformanceDashboardsTable({
  onDuplicatePeriod,
  onEditPeriod,
  onUpdateStatus,
  periods,
}) {
  const [statusChange, setStatusChange] = useState(null)
  const requestStatusChange = useCallback((period, status) => {
    if (period.status === status) {
      return
    }

    setStatusChange({
      period,
      status,
      ...getStatusChangeCopy(period, status),
    })
  }, [])
  const columns = useMemo(() => [
    {
      accessorKey: 'title',
      cell: ({ row }) => {
        const period = row.original
        const heroMetric = getHeroMetric(period)

        return (
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">{period.title}</p>
            <p className="mt-1 max-w-xl truncate text-label font-normal text-text-muted">
              {heroMetric.label}: {heroMetric.value}
            </p>
          </div>
        )
      },
      header: 'Dashboard',
      meta: {
        label: 'Dashboard',
        minWidthClassName: 'min-w-[280px]',
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
      accessorKey: 'periodStart',
      cell: ({ row }) => formatPeriod(row.original),
      header: 'Period',
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
      accessorKey: 'dataModeMeta.label',
      cell: ({ row }) => (
        <div className="grid gap-1.5">
          <StatusBadge meta={row.original.dataModeMeta} />
          <StatusBadge meta={row.original.dataConfidenceMeta} />
        </div>
      ),
      header: 'Data',
      enableSorting: false,
    },
    {
      accessorKey: 'lastUpdatedAt',
      cell: ({ row }) => formatDate(row.original.lastUpdatedAt, {
        hour: '2-digit',
        minute: '2-digit',
      }),
      header: 'Freshness',
      meta: {
        cellClassName: 'text-text-muted',
      },
    },
    {
      accessorKey: 'publishedAt',
      cell: ({ row }) => formatDate(row.original.publishedAt),
      header: 'Published',
      meta: {
        cellClassName: 'text-text-muted',
      },
    },
    {
      cell: ({ row }) => {
        const period = row.original

        return (
          <div className="flex justify-end gap-1.5">
            <Button onClick={() => onEditPeriod(period)} size="sm" type="button" variant="outline">
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="Dashboard actions" size="icon-sm" type="button" variant="ghost">
                  <Icon name="ellipsis" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-60">
                <DropdownMenuItem asChild>
                  <Link to={`/admin/client-performance-preview?clientId=${period.clientId}&performancePeriodId=${period.id}`}>
                    <Icon name="layoutDashboard" size={15} />
                    Preview as client
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDuplicatePeriod(period.id)}>
                  <Icon name="fileText" size={15} />
                  Duplicate as draft
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {statusOrder.map((status) => (
                  <DropdownMenuItem
                    disabled={status === period.status}
                    key={status}
                    onClick={() => requestStatusChange(period, status)}
                  >
                    <Icon name={PERFORMANCE_DASHBOARD_STATUS_META[status]?.icon ?? 'circle'} size={15} />
                    <span>Set {PERFORMANCE_DASHBOARD_STATUS_META[status]?.label ?? status}</span>
                  </DropdownMenuItem>
                ))}
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
  ], [onDuplicatePeriod, onEditPeriod, requestStatusChange])

  function confirmStatusChange() {
    if (!statusChange) {
      return
    }

    onUpdateStatus(statusChange.period.id, statusChange.status)
    setStatusChange(null)
  }

  return (
    <>
      <DataTableSurface>
        <DataTable
          columns={columns}
          data={periods}
          emptyMessage="No performance dashboards yet."
          getRowId={(period) => period.id}
        />
      </DataTableSurface>

      <ConfirmationDialog
        confirmLabel={statusChange?.confirmLabel ?? 'Change status'}
        description={statusChange?.description ?? ''}
        onConfirm={confirmStatusChange}
        onOpenChange={(open) => {
          if (!open) {
            setStatusChange(null)
          }
        }}
        open={Boolean(statusChange)}
        title={statusChange?.title ?? 'Change dashboard status?'}
        tone={statusChange?.tone ?? 'primary'}
      />
    </>
  )
}
