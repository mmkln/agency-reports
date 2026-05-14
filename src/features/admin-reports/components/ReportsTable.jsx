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

export function ReportsTable({
  onDeleteReport,
  onDuplicateReport,
  onEditReport,
  onUpdateStatus,
  reports,
}) {
  const [reportPendingDelete, setReportPendingDelete] = useState(null)

  function confirmDeleteReport() {
    if (!reportPendingDelete) {
      return
    }

    onDeleteReport(reportPendingDelete.id)
    setReportPendingDelete(null)
  }

  return (
    <>
      <Card className="border-control-border bg-block py-0 shadow-none">
        <Table className="min-w-[1120px]">
          <TableHeader className="border-b border-control-border bg-surface-subtle text-xs font-semibold tracking-wide text-text-muted uppercase">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-3">Report</TableHead>
              <TableHead className="px-6 py-3">Client</TableHead>
              <TableHead className="px-6 py-3">Period</TableHead>
              <TableHead className="px-6 py-3">Status</TableHead>
              <TableHead className="px-6 py-3">Published</TableHead>
              <TableActionHead className="px-6 py-3">Actions</TableActionHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-separator">
            {reports.map((report) => {
              const canPreview = [
                REPORT_STATUSES.PUBLISHED,
                REPORT_STATUSES.ARCHIVED,
              ].includes(report.status)

              return (
                <TableRow className="transition-colors hover:bg-block-subtle" key={report.id}>
                  <TableCell className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{report.title}</p>
                      <p className="mt-1 max-w-lg truncate text-xs text-text-muted">
                        {report.summary || 'No executive summary yet'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="font-medium text-text-secondary">{report.client.name}</p>
                    <p className="mt-0.5 text-xs text-text-muted">/{report.client.portalSlug}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-text-secondary">
                    {formatPeriod(report)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <StatusBadge meta={report.statusMeta} />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-text-muted">
                    {formatDate(report.publishedAt)}
                  </TableCell>
                  <TableActionCell className="px-6 py-4 group-hover/table-row:bg-block-subtle">
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
                          {canPreview ? (
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/client-report-preview?clientId=${report.clientId}&reportId=${report.id}`}>
                                <Icon name="fileText" size={15} />
                                Preview report
                              </Link>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem disabled>
                              <Icon name="fileText" size={15} />
                              Preview unavailable
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDuplicateReport(report.id)}>
                            <Icon name="fileText" size={15} />
                            Duplicate report
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {[
                            REPORT_STATUSES.DRAFT,
                            REPORT_STATUSES.READY,
                            REPORT_STATUSES.PUBLISHED,
                            REPORT_STATUSES.ARCHIVED,
                          ].map((status) => (
                            <DropdownMenuItem
                              disabled={status === report.status}
                              key={status}
                              onClick={() => onUpdateStatus(report.id, status)}
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
      </Card>

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
    </>
  )
}
