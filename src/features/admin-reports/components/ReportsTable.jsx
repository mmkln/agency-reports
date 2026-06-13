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

import { REPORT_STATUSES, REPORT_STATUS_META } from '../../../entities/report'
import { Icon } from '../../../shared/icons'

function formatDate(date) {
  if (!date) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatPeriod(report) {
  return `${formatDate(report.periodStart)} - ${formatDate(report.periodEnd)}`
}

const statusOrder = [
  REPORT_STATUSES.DRAFT,
  REPORT_STATUSES.READY,
  REPORT_STATUSES.PUBLISHED,
  REPORT_STATUSES.ARCHIVED,
]

function getStatusChangeCopy(report, nextStatus) {
  const nextStatusMeta = REPORT_STATUS_META[nextStatus] ?? {
    label: nextStatus,
  }

  if (report.status === REPORT_STATUSES.PUBLISHED && nextStatus === REPORT_STATUSES.DRAFT) {
    return {
      confirmLabel: 'Move to draft',
      description: `"${report.title}" will be hidden from client users immediately. Use this only when the published report needs to be pulled back for editing.`,
      title: 'Move published report to draft?',
      tone: 'destructive',
    }
  }

  if (report.status === REPORT_STATUSES.PUBLISHED && nextStatus === REPORT_STATUSES.ARCHIVED) {
    return {
      confirmLabel: 'Archive report',
      description: `"${report.title}" will remain visible in the client report archive, but it will no longer be treated as the active published report.`,
      title: 'Archive published report?',
      tone: 'primary',
    }
  }

  if (nextStatus === REPORT_STATUSES.PUBLISHED) {
    return {
      confirmLabel: 'Publish report',
      description: `"${report.title}" will become visible to the client on the overview and in the report archive.`,
      title: 'Publish monthly report?',
      tone: 'primary',
    }
  }

  return {
    confirmLabel: `Set ${nextStatusMeta.label}`,
    description: `"${report.title}" will be set to ${nextStatusMeta.label}.`,
    title: 'Change report status?',
    tone: 'primary',
  }
}

export function ReportsTable({
  onDeleteReport,
  onDuplicateReport,
  onEditReport,
  onUpdateStatus,
  reports,
}) {
  const [reportPendingDelete, setReportPendingDelete] = useState(null)
  const [statusChange, setStatusChange] = useState(null)
  const requestStatusChange = useCallback((report, status) => {
    if (status === report.status) {
      return
    }

    setStatusChange({
      report,
      status,
      ...getStatusChangeCopy(report, status),
    })
  }, [])
  const columns = useMemo(() => [
    {
      accessorKey: 'title',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-text-primary">{row.original.title}</p>
          <p className="mt-1 max-w-lg truncate text-label font-normal text-text-muted">
            {row.original.summary || 'No executive summary yet'}
          </p>
        </div>
      ),
      header: 'Report',
      meta: {
        label: 'Report',
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
      accessorKey: 'publishedAt',
      cell: ({ row }) => formatDate(row.original.publishedAt),
      header: 'Published',
      meta: {
        cellClassName: 'text-text-muted',
      },
    },
    {
      cell: ({ row }) => {
        const report = row.original

        return (
          <div className="flex justify-end gap-1.5">
            <Button onClick={() => onEditReport(report)} size="sm" type="button" variant="outline">
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="Report actions" size="icon-sm" type="button" variant="ghost">
                  <Icon name="ellipsis" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56">
                <DropdownMenuItem asChild>
                  <Link to={`/admin/client-report-preview?clientId=${report.clientId}&reportId=${report.id}`}>
                    <Icon name="fileText" size={15} />
                    Preview report
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDuplicateReport(report.id)}>
                  <Icon name="fileText" size={15} />
                  Duplicate report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {statusOrder.map((status) => (
                  <DropdownMenuItem
                    disabled={status === report.status}
                    key={status}
                    onClick={() => requestStatusChange(report, status)}
                  >
                    <Icon name={REPORT_STATUS_META[status]?.icon ?? 'circle'} size={15} />
                    <span>Set {REPORT_STATUS_META[status]?.label ?? status}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setReportPendingDelete(report)}
                  variant="destructive"
                >
                  <Icon name="close" size={15} />
                  Delete report
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
  ], [onDuplicateReport, onEditReport, requestStatusChange])

  function confirmDeleteReport() {
    if (!reportPendingDelete) {
      return
    }

    onDeleteReport(reportPendingDelete.id)
    setReportPendingDelete(null)
  }

  function confirmStatusChange() {
    if (!statusChange) {
      return
    }

    onUpdateStatus(statusChange.report.id, statusChange.status)
    setStatusChange(null)
  }

  return (
    <>
      <DataTableSurface>
        <DataTable
          columns={columns}
          data={reports}
          emptyMessage="No reports yet."
          getRowId={(report) => report.id}
        />
      </DataTableSurface>

      <ConfirmationDialog
        confirmLabel="Delete report"
        description={
          reportPendingDelete
            ? `This removes "${reportPendingDelete.title}". Portal users will no longer see it.`
            : ''
        }
        onConfirm={confirmDeleteReport}
        onOpenChange={(open) => {
          if (!open) {
            setReportPendingDelete(null)
          }
        }}
        open={Boolean(reportPendingDelete)}
        title="Delete monthly report?"
        tone="destructive"
      />

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
        title={statusChange?.title ?? 'Change report status?'}
        tone={statusChange?.tone ?? 'primary'}
      />
    </>
  )
}
