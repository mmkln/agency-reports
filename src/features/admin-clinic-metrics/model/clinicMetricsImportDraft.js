import { normalizeClinicImportPayload } from '../../../domain/services/clinicImportContractService'
import {
  assertImportHasCurrentSectionRecords,
  getIgnoredSectionWarnings,
  parseClinicImportJson,
} from '../../admin-clinic-import'

function getUniqueValues(records, fieldName) {
  return [...new Set(records.map((record) => record[fieldName]).filter(Boolean))].sort()
}

function getUniquePeriods(normalizedPayload) {
  return [...new Set([
    ...normalizedPayload.metricsInput.patientAcquisitionSnapshots.map((record) => record.period_label),
    ...normalizedPayload.metricsInput.callBookingMetrics.map((record) => record.period_label),
    ...normalizedPayload.metricsInput.serviceLinePerformance.map((record) => record.period_label),
  ].filter(Boolean))].sort()
}

function summarizeClinicMetricsImport(normalizedPayload) {
  const {
    callBookingMetrics,
    patientAcquisitionSnapshots,
    serviceLinePerformance,
  } = normalizedPayload.metricsInput

  return {
    callBookingCount: callBookingMetrics.length,
    campaignNames: getUniqueValues([
      ...patientAcquisitionSnapshots,
      ...callBookingMetrics,
      ...serviceLinePerformance,
    ], 'campaign_name'),
    patientAcquisitionCount: patientAcquisitionSnapshots.length,
    periods: getUniquePeriods(normalizedPayload),
    serviceLinePerformanceCount: serviceLinePerformance.length,
  }
}

function getMetricRecordCount(summary) {
  return summary.patientAcquisitionCount
    + summary.callBookingCount
    + summary.serviceLinePerformanceCount
}

export function previewClinicMetricsImport({
  clientId,
  rawJson,
  now,
}) {
  const parsedPayload = parseClinicImportJson(rawJson, 'Clinic metrics')
  const normalizedPayload = normalizeClinicImportPayload(parsedPayload, { now })

  if (normalizedPayload.clientId !== clientId) {
    throw new Error('Imported clinic metrics belong to a different client workspace.')
  }

  const summary = summarizeClinicMetricsImport(normalizedPayload)

  assertImportHasCurrentSectionRecords({
    currentSection: 'metrics',
    normalizedPayload,
    recordCount: getMetricRecordCount(summary),
    recordLabel: 'clinic metric',
  })

  return {
    contractVersion: normalizedPayload.contractVersion,
    normalizedPayload,
    summary,
    warnings: getIgnoredSectionWarnings({
      currentSection: 'metrics',
      normalizedPayload,
    }),
  }
}

export function applyClinicMetricsImportToDraft({ draft, importPlan }) {
  if (!draft) {
    throw new Error('Clinic metrics draft is not available.')
  }

  if (!importPlan?.normalizedPayload?.metricsInput) {
    throw new Error('Preview the clinic metrics import before applying it.')
  }

  const {
    callBookingMetrics,
    patientAcquisitionSnapshots,
    serviceLinePerformance,
  } = importPlan.normalizedPayload.metricsInput

  return {
    ...draft,
    callBookingMetrics: [
      ...callBookingMetrics,
      ...draft.callBookingMetrics,
    ],
    patientAcquisitionSnapshots: [
      ...patientAcquisitionSnapshots,
      ...draft.patientAcquisitionSnapshots,
    ],
    serviceLinePerformance: [
      ...serviceLinePerformance,
      ...draft.serviceLinePerformance,
    ],
  }
}
