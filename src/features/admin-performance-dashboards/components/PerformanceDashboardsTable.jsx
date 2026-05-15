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
  TableActionCell,
  TableActionHead,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

  function requestStatusChange(period, status) {
    if (period.status === status) {
      return
    }

    setStatusChange({
      period,
      status,
      ...getStatusChangeCopy(period, status),
    })
  }

  function confirmStatusChange() {
    if (!statusChange) {
      return
    }

    onUpdateStatus(statusChange.period.id, statusChange.status)
    setStatusChange(null)
  }

  return (
    <>
      <Card className="border-control-border bg-block py-0 shadow-none">
        <Table className="min-w-[1180px]">
          <TableHeader className="border-b border-control-border bg-surface-subtle text-xs font-semibold tracking-wide text-text-muted uppercase">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-3">Dashboard</TableHead>
              <TableHead className="px-6 py-3">Client</TableHead>
              <TableHead className="px-6 py-3">Period</TableHead>
              <TableHead className="px-6 py-3">Status</TableHead>
              <TableHead className="px-6 py-3">Data</TableHead>
              <TableHead className="px-6 py-3">Freshness</TableHead>
              <TableHead className="px-6 py-3">Published</TableHead>
              <TableActionHead className="px-6 py-3">Actions</TableActionHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-separator">
            {periods.map((period) => {
              const heroMetric = getHeroMetric(period)

              return (
                <TableRow className="transition-colors hover:bg-block-subtle" key={period.id}>
                  <TableCell className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{period.title}</p>
                      <p className="mt-1 max-w-xl truncate text-xs text-text-muted">
                        {heroMetric.label}: {heroMetric.value}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="font-medium text-text-secondary">{period.client.name}</p>
                    <p className="mt-0.5 text-xs text-text-muted">/{period.client.portalSlug}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-text-secondary">
                    {formatPeriod(period)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <StatusBadge meta={period.statusMeta} />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="grid gap-1.5">
                      <StatusBadge meta={period.dataModeMeta} />
                      <StatusBadge meta={period.dataConfidenceMeta} />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-text-muted">
                    {formatDate(period.lastUpdatedAt, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-text-muted">
                    {formatDate(period.publishedAt)}
                  </TableCell>
                  <TableActionCell className="px-6 py-4 group-hover/table-row:bg-block-subtle">
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
                  </TableActionCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

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
