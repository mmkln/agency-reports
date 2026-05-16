import {
  Button,
  Checkbox,
  Input,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge as SharedStatusBadge,
  Textarea,
} from '@/shared/ui'

import { DASHBOARD_LINK_STATUSES, DASHBOARD_LINK_STATUS_META, DASHBOARD_PROVIDERS } from '../../../entities/dashboard-link'
import { REPORT_STATUSES, REPORT_STATUS_META } from '../../../entities/report'
import { Icon } from '../../../shared/icons'
import {
  createBlankDashboardLink,
  createBlankReport,
} from '../model'
import { EditorCard } from './EditorCard'

export function ClientLinksAssetsPanel({ draft, onUpdateDashboardLinks, onUpdateReports }) {
  const dashboardLink = draft.dashboardLinks[0] ?? createBlankDashboardLink()
  const report = draft.reports[0] ?? createBlankReport()
  const visibleReports = draft.reports.filter((item) => [
    REPORT_STATUSES.PUBLISHED,
    REPORT_STATUSES.ARCHIVED,
  ].includes(item.status))

  function updateDashboardField(fieldName, value) {
    const nextLinks = draft.dashboardLinks.length > 0 ? [...draft.dashboardLinks] : [dashboardLink]
    nextLinks[0] = {
      ...nextLinks[0],
      [fieldName]: value,
    }
    onUpdateDashboardLinks(nextLinks)
  }

  function updateReportField(fieldName, value) {
    const nextReports = draft.reports.length > 0 ? [...draft.reports] : [report]
    nextReports[0] = {
      ...nextReports[0],
      [fieldName]: value,
    }
    onUpdateReports(nextReports)
  }

  return (
    <EditorCard iconName="link" title="Client Links & Assets">
      <div className="grid grid-cols-1 gap-5">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between">
            <p className="text-label text-text-secondary uppercase">Marketing Dashboard</p>
            <SharedStatusBadge meta={DASHBOARD_LINK_STATUS_META[dashboardLink.status]} />
          </div>
          <Input
            onChange={(event) => updateDashboardField('public_url', event.target.value)}
            placeholder="Public URL: https://lookerstudio.google.com/reporting/..."
            value={dashboardLink.public_url}
          />
          <Input
            onChange={(event) => updateDashboardField('embed_url', event.target.value)}
            placeholder="Embed URL: https://lookerstudio.google.com/embed/..."
            value={dashboardLink.embed_url}
          />
          <Textarea
            className="min-h-16"
            onChange={(event) => updateDashboardField('fallback_message', event.target.value)}
            placeholder="Fallback message shown when dashboard is not ready or unavailable"
            value={dashboardLink.fallback_message}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Select
              onValueChange={(value) => updateDashboardField('status', value)}
              value={dashboardLink.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Dashboard status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DASHBOARD_LINK_STATUSES).map((status) => (
                  <SelectItem key={status} value={status}>
                    {DASHBOARD_LINK_STATUS_META[status]?.label ?? status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) => updateDashboardField('provider', value)}
              value={dashboardLink.provider}
            >
              <SelectTrigger>
                <SelectValue placeholder="Dashboard provider" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DASHBOARD_PROVIDERS).map((provider) => (
                  <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-label font-normal text-text-secondary">
            <Checkbox
              checked={dashboardLink.show_on_overview}
              onCheckedChange={(checked) => updateDashboardField('show_on_overview', Boolean(checked))}
            />
            Show on Client Overview
          </label>
        </div>

        <div className="min-w-0 border-t border-separator pt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-label text-text-secondary uppercase">Latest Published Report</p>
            <Button
              onClick={() => onUpdateReports([createBlankReport(), ...draft.reports])}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Icon name="plus" size={14} />
              New report
            </Button>
          </div>
          <Select
            onValueChange={(value) => {
              const selectedReport = draft.reports.find((item) => item.id === value)
              if (selectedReport) {
                onUpdateReports([selectedReport, ...draft.reports.filter((item) => item.id !== selectedReport.id)])
              }
            }}
            value={report.id || '__current_report__'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent>
              {visibleReports.length > 0 ? visibleReports.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.title} ({REPORT_STATUS_META[item.status]?.label ?? item.status})
                </SelectItem>
              )) : (
                <SelectItem value="__current_report__">{report.title || 'No published report yet'}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Textarea
            className="mt-3 min-h-20"
            onChange={(event) => updateReportField('summary', event.target.value)}
            placeholder="Summary preview"
            value={report.summary}
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Input
              onChange={(event) => updateReportField('title', event.target.value)}
              placeholder="May 2026 Summary"
              value={report.title}
            />
            <Select
              onValueChange={(value) => updateReportField('status', value)}
              value={report.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Report status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(REPORT_STATUSES).map((status) => (
                  <SelectItem key={status} value={status}>
                    {REPORT_STATUS_META[status]?.label ?? status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Input
              onChange={(event) => updateReportField('period_start', event.target.value)}
              type="date"
              value={report.period_start}
            />
            <Input
              onChange={(event) => updateReportField('period_end', event.target.value)}
              type="date"
              value={report.period_end}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <Input
              onChange={(event) => updateReportField('dashboard_url', event.target.value)}
              placeholder="Dashboard URL"
              value={report.dashboard_url}
            />
            <Input
              onChange={(event) => updateReportField('pdf_url', event.target.value)}
              placeholder="PDF/report URL"
              value={report.pdf_url}
            />
          </div>
        </div>
      </div>
    </EditorCard>
  )
}
