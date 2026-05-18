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

  function confirmDeleteReport() {
    if (!reportPendingDelete) {
      return
    }

    onDeleteReport(reportPendingDelete.id)
    setReportPendingDelete(null)
  }

  function requestStatusChange(report, status) {
    if (status === report.status) {
      return
    }

    setStatusChange({
      report,
      status,
      ...getStatusChangeCopy(report, status),
    })
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
        <Table className="min-w-[1120px]">
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableActionHead>Actions</TableActionHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => {
              return (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{report.title}</p>
                      <p className="mt-1 max-w-lg truncate text-label font-normal text-text-muted">
                        {report.summary || 'No executive summary yet'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-text-secondary">{report.client.name}</p>
                    <p className="mt-0.5 text-label font-normal text-text-muted">/{report.client.portalSlug}</p>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatPeriod(report)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge meta={report.statusMeta} />
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {formatDate(report.publishedAt)}
                  </TableCell>
                  <TableActionCell>
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
                  </TableActionCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </DataTableSurface>

      <ConfirmationDialog
        confirmLabel="Delete report"
        description={
          reportPendingDelete
            ? `This removes "${reportPendingDelete.title}" from local demo data. Client users will no longer see it.`
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
