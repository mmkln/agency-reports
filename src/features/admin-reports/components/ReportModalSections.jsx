import {
  Input,
  Label,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'

import { REPORT_STATUSES, REPORT_STATUS_META } from '../../../entities/report'
import { Icon } from '../../../shared/icons'

const REPORT_STATUS_DESCRIPTIONS = Object.freeze({
  [REPORT_STATUSES.DRAFT]: 'Internal draft. Hidden from client users.',
  [REPORT_STATUSES.READY]: 'Ready for team review. Still hidden from portal users.',
  [REPORT_STATUSES.PUBLISHED]: 'Visible to client users on the overview and report archive.',
  [REPORT_STATUSES.ARCHIVED]: 'Visible in the client archive, but no longer treated as the latest active report.',
})

function ReportFormSection({ children, description, iconName, title }) {
  return (
    <section className="rounded-block border border-control-border bg-block shadow-none">
      <div className="border-b border-separator bg-surface-subtle px-card py-component">
        <div className="flex items-start gap-3">
          {iconName ? (
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-control text-text-quaternary">
              <Icon name={iconName} size={16} />
            </span>
          ) : null}
          <div>
            <h3 className="text-ui text-text-primary">{title}</h3>
            {description ? (
              <p className="mt-1 text-label font-normal text-text-muted">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="grid gap-component p-card">
        {children}
      </div>
    </section>
  )
}

function StatusGuidance({ status }) {
  const statusMeta = REPORT_STATUS_META[status] ?? REPORT_STATUS_META[REPORT_STATUSES.DRAFT]

  return (
    <div className="rounded-control border border-control-border bg-control px-3 py-2">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 text-text-quaternary" name={statusMeta.icon ?? 'circle'} size={15} />
        <div>
          <p className="text-label text-text-primary">{statusMeta.label}</p>
          <p className="mt-0.5 text-label font-normal text-text-muted">
            {REPORT_STATUS_DESCRIPTIONS[status] ?? 'Report visibility follows its status.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ReportSetupSection({
  clients,
  form,
  hasClients,
  mode,
  onUpdateField,
}) {
  return (
    <ReportFormSection
      description="Define who this report belongs to, which period it covers, and whether clients can see it."
      iconName="fileText"
      title="Report setup"
    >
      <div className="grid gap-2">
        <Label htmlFor="report-client">Account *</Label>
        <Select
          disabled={mode === 'edit' || !hasClients}
          onValueChange={(value) => onUpdateField('clientId', value)}
          value={form.clientId}
        >
          <SelectTrigger id="report-client">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="report-title">Report title *</Label>
        <Input
          id="report-title"
          onChange={(event) => onUpdateField('title', event.target.value)}
          placeholder="May 2026 Monthly Summary"
          required
          value={form.title}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_220px]">
        <div className="grid gap-2">
          <Label htmlFor="report-period-start">Period start *</Label>
          <Input
            id="report-period-start"
            onChange={(event) => onUpdateField('periodStart', event.target.value)}
            required
            type="date"
            value={form.periodStart}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="report-period-end">Period end *</Label>
          <Input
            id="report-period-end"
            onChange={(event) => onUpdateField('periodEnd', event.target.value)}
            required
            type="date"
            value={form.periodEnd}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="report-status">Status *</Label>
          <Select onValueChange={(value) => onUpdateField('status', value)} value={form.status}>
            <SelectTrigger id="report-status">
              <SelectValue placeholder="Status" />
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
      </div>

      <StatusGuidance status={form.status} />
    </ReportFormSection>
  )
}

export function ClientNarrativeSection({ form, onUpdateField }) {
  return (
    <ReportFormSection
      description="This is the portal-ready explanation. Keep it specific, plain-language, and decision-oriented."
      iconName="messageSquare"
      title="Portal narrative"
    >
      <div className="grid gap-2">
        <Label htmlFor="report-summary">Executive summary</Label>
        <Textarea
          id="report-summary"
          onChange={(event) => onUpdateField('summary', event.target.value)}
          placeholder="Short plain-language overview of the month."
          rows={4}
          value={form.summary}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ReportTextarea
          id="report-work"
          label="What we did"
          onChange={(value) => onUpdateField('whatWeDid', value)}
          placeholder="- Work item 1"
          value={form.whatWeDid}
        />
        <ReportTextarea
          id="report-results"
          label="Results"
          onChange={(value) => onUpdateField('results', value)}
          placeholder="Spend, leads, CPL, booked calls, conversion rate..."
          value={form.results}
        />
        <ReportTextarea
          id="report-wins"
          label="Wins"
          onChange={(value) => onUpdateField('wins', value)}
          placeholder="- Win 1"
          value={form.wins}
        />
        <ReportTextarea
          id="report-problems"
          label="Problems / blockers"
          onChange={(value) => onUpdateField('problems', value)}
          placeholder="- Problem 1"
          value={form.problems}
        />
        <ReportTextarea
          id="report-next-actions"
          label="Next actions"
          onChange={(value) => onUpdateField('nextActions', value)}
          placeholder="- Action 1"
          value={form.nextActions}
        />
        <ReportTextarea
          id="report-client-decisions"
          label="Needed from account"
          onChange={(value) => onUpdateField('clientDecisionsNeeded', value)}
          placeholder="- Decision / approval / access needed"
          value={form.clientDecisionsNeeded}
        />
      </div>
    </ReportFormSection>
  )
}

function ReportTextarea({ id, label, onChange, placeholder, value }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={5}
        value={value}
      />
    </div>
  )
}

export function SupportingLinksSection({ form, onUpdateField }) {
  return (
    <ReportFormSection
      description="Dashboards show the numbers. The report explains what the numbers mean."
      iconName="layoutDashboard"
      title="Supporting links"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="report-dashboard-url">Dashboard URL</Label>
          <Input
            id="report-dashboard-url"
            onChange={(event) => onUpdateField('dashboardUrl', event.target.value)}
            placeholder="https://lookerstudio.google.com/reporting/..."
            type="url"
            value={form.dashboardUrl}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="report-pdf-url">PDF / full report URL</Label>
          <Input
            id="report-pdf-url"
            onChange={(event) => onUpdateField('pdfUrl', event.target.value)}
            placeholder="https://drive.google.com/..."
            type="url"
            value={form.pdfUrl}
          />
        </div>
      </div>
    </ReportFormSection>
  )
}

export function InternalNotesSection({ form, onUpdateField }) {
  return (
    <ReportFormSection
      description="Private team context. These notes are never rendered in the portal."
      iconName="lock"
      title="Internal notes"
    >
      <div className="grid gap-2">
        <Label htmlFor="report-internal-notes">Internal notes</Label>
        <Textarea
          id="report-internal-notes"
          onChange={(event) => onUpdateField('internalNotes', event.target.value)}
          placeholder="Internal context for the team. Never shown in the portal."
          rows={3}
          value={form.internalNotes}
        />
      </div>
    </ReportFormSection>
  )
}
