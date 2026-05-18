import {
  Button,
  Input,
  Label,
  Textarea,
} from '@/shared/ui'

import { CLIENT_TYPES } from '../../../entities/client'

function createEmptyClinicSections() {
  return {
    agencyWorkCompleted: [],
    bookingLeakage: {
      followUpNeeded: 0,
      missedCalls: 0,
      noResponseLeads: 0,
      summary: '',
    },
    clinicActionsNeeded: [],
    compliance: {
      limitedAds: 0,
      openIssues: 0,
      pendingApprovals: 0,
      summary: '',
    },
    nextMonthPlan: [],
    patientAcquisition: {
      bookedAppointments: 0,
      costPerBookedAppointment: 0,
      inquiries: 0,
      summary: '',
      topLocations: [],
      topServiceLines: [],
    },
    reputation: {
      googleRating: 0,
      reviewsGained: 0,
      summary: '',
      unansweredReviews: 0,
    },
  }
}

function getClinicSections(form) {
  const emptySections = createEmptyClinicSections()
  const currentSections = form.clinicSections ?? {}

  return {
    ...emptySections,
    ...currentSections,
    bookingLeakage: {
      ...emptySections.bookingLeakage,
      ...currentSections.bookingLeakage,
    },
    compliance: {
      ...emptySections.compliance,
      ...currentSections.compliance,
    },
    patientAcquisition: {
      ...emptySections.patientAcquisition,
      ...currentSections.patientAcquisition,
    },
    reputation: {
      ...emptySections.reputation,
      ...currentSections.reputation,
    },
  }
}

function getListText(items) {
  return Array.isArray(items) ? items.join('\n') : ''
}

function getListValue(value) {
  return String(value ?? '')
    .split('\n')
    .map((item) => item.trim().replace(/^-+\s*/, ''))
    .filter(Boolean)
}

function MetricInput({ label, onChange, value }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input
        inputMode="decimal"
        onChange={(event) => onChange(event.target.value)}
        type="number"
        value={value ?? 0}
      />
    </div>
  )
}

function SectionTextarea({ label, onChange, placeholder, value }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Textarea
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        value={value ?? ''}
      />
    </div>
  )
}

export function ClinicReportTemplateSection({
  clients,
  form,
  onApplyTemplate,
  onUpdateField,
}) {
  const selectedClient = clients.find((client) => client.id === form.clientId)

  if (selectedClient?.type !== CLIENT_TYPES.CLINIC) {
    return null
  }

  const sections = getClinicSections(form)

  function updateGroup(groupName, fieldName, value) {
    onUpdateField('clinicSections', {
      ...sections,
      [groupName]: {
        ...sections[groupName],
        [fieldName]: value,
      },
    })
  }

  function updateList(fieldName, value) {
    onUpdateField('clinicSections', {
      ...sections,
      [fieldName]: getListValue(value),
    })
  }

  return (
    <section className="rounded-block border border-control-border bg-block shadow-none">
      <div className="border-b border-separator bg-surface-subtle px-card py-component">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-ui text-text-primary">Clinic report template</h3>
            <p className="mt-1 text-label font-normal text-text-muted">
              Structured patient acquisition, booking, reputation, compliance, and clinic-action sections.
            </p>
          </div>
          <Button onClick={() => onApplyTemplate(form.clientId)} size="sm" type="button" variant="outline">
            Fill from clinic metrics
          </Button>
        </div>
      </div>

      <div className="grid gap-component p-card">
        <div className="grid gap-component md:grid-cols-3">
          <MetricInput
            label="Inquiries"
            onChange={(value) => updateGroup('patientAcquisition', 'inquiries', value)}
            value={sections.patientAcquisition.inquiries}
          />
          <MetricInput
            label="Booked appointments"
            onChange={(value) => updateGroup('patientAcquisition', 'bookedAppointments', value)}
            value={sections.patientAcquisition.bookedAppointments}
          />
          <MetricInput
            label="Cost per booked"
            onChange={(value) => updateGroup('patientAcquisition', 'costPerBookedAppointment', value)}
            value={sections.patientAcquisition.costPerBookedAppointment}
          />
        </div>

        <SectionTextarea
          label="Patient acquisition summary"
          onChange={(value) => updateGroup('patientAcquisition', 'summary', value)}
          placeholder="What happened with patient acquisition this period"
          value={sections.patientAcquisition.summary}
        />

        <div className="grid gap-component md:grid-cols-3">
          <MetricInput
            label="Missed calls"
            onChange={(value) => updateGroup('bookingLeakage', 'missedCalls', value)}
            value={sections.bookingLeakage.missedCalls}
          />
          <MetricInput
            label="No-response leads"
            onChange={(value) => updateGroup('bookingLeakage', 'noResponseLeads', value)}
            value={sections.bookingLeakage.noResponseLeads}
          />
          <MetricInput
            label="Follow-up needed"
            onChange={(value) => updateGroup('bookingLeakage', 'followUpNeeded', value)}
            value={sections.bookingLeakage.followUpNeeded}
          />
        </div>

        <div className="grid gap-component md:grid-cols-2">
          <SectionTextarea
            label="Booking leakage summary"
            onChange={(value) => updateGroup('bookingLeakage', 'summary', value)}
            placeholder="Where patients are leaking after inquiry"
            value={sections.bookingLeakage.summary}
          />
          <SectionTextarea
            label="Reputation summary"
            onChange={(value) => updateGroup('reputation', 'summary', value)}
            placeholder="Trust and review performance"
            value={sections.reputation.summary}
          />
          <SectionTextarea
            label="Compliance summary"
            onChange={(value) => updateGroup('compliance', 'summary', value)}
            placeholder="Policy, claim, approval, and privacy risks"
            value={sections.compliance.summary}
          />
        </div>

        <div className="grid gap-component md:grid-cols-3">
          <SectionTextarea
            label="Agency work completed"
            onChange={(value) => updateList('agencyWorkCompleted', value)}
            placeholder="- Work item"
            value={getListText(sections.agencyWorkCompleted)}
          />
          <SectionTextarea
            label="Clinic actions needed"
            onChange={(value) => updateList('clinicActionsNeeded', value)}
            placeholder="- Clinic action"
            value={getListText(sections.clinicActionsNeeded)}
          />
          <SectionTextarea
            label="Next month plan"
            onChange={(value) => updateList('nextMonthPlan', value)}
            placeholder="- Plan item"
            value={getListText(sections.nextMonthPlan)}
          />
        </div>
      </div>
    </section>
  )
}
