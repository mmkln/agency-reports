import { useMemo, useState } from 'react'

import { REPORT_STATUSES } from '../../../entities/report'

function formatInputDate(value) {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 10)
}

function createInitialForm({ clientId = '', report = null } = {}) {
  return {
    clientDecisionsNeeded: report?.clientDecisionsNeeded ?? report?.client_decisions_needed ?? '',
    clientId: report?.clientId ?? report?.client_id ?? clientId,
    clinicSections: report?.clinicSections ?? report?.clinic_sections ?? null,
    dashboardUrl: report?.dashboardUrl ?? report?.dashboard_url ?? '',
    id: report?.id ?? '',
    internalNotes: report?.internalNotes ?? report?.internal_notes ?? '',
    nextActions: report?.nextActions ?? report?.next_actions ?? '',
    pdfUrl: report?.pdfUrl ?? report?.pdf_url ?? '',
    periodEnd: formatInputDate(report?.periodEnd ?? report?.period_end),
    periodStart: formatInputDate(report?.periodStart ?? report?.period_start),
    problems: report?.problems ?? '',
    results: report?.results ?? '',
    status: report?.status ?? REPORT_STATUSES.DRAFT,
    summary: report?.summary ?? '',
    title: report?.title ?? '',
    whatWeDid: report?.whatWeDid ?? report?.what_we_did ?? '',
    wins: report?.wins ?? '',
  }
}

export function useReportForm({ clientId, onSubmit, report }) {
  const initialForm = useMemo(() => createInitialForm({ clientId, report }), [clientId, report])
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)

  function updateField(fieldName, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
    setError('')
  }

  function applyTemplate(template) {
    setForm((currentForm) => ({
      ...currentForm,
      clientDecisionsNeeded: template.clientDecisionsNeeded ?? currentForm.clientDecisionsNeeded,
      clinicSections: template.clinicSections ?? currentForm.clinicSections,
      nextActions: template.nextActions ?? currentForm.nextActions,
      problems: template.problems ?? currentForm.problems,
      results: template.results ?? currentForm.results,
      summary: template.summary ?? currentForm.summary,
    }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    return Promise.resolve(onSubmit(form))
      .catch((caughtError) => {
        setError(caughtError.message)
      })
  }

  return {
    error,
    applyTemplate,
    form,
    handleSubmit,
    setError,
    updateField,
  }
}
