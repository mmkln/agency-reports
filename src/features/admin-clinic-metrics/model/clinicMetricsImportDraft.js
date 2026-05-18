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
    ...normalizedPayload.metricsInput.bookingPipelineSnapshots.map((record) => record.period_label),
    ...normalizedPayload.metricsInput.patientAcquisitionSnapshots.map((record) => record.period_label),
    ...normalizedPayload.metricsInput.callBookingMetrics.map((record) => record.period_label),
    ...normalizedPayload.metricsInput.locationPerformance.map((record) => record.period_label),
    ...normalizedPayload.metricsInput.serviceLinePerformance.map((record) => record.period_label),
  ].filter(Boolean))].sort()
}

function summarizeClinicMetricsImport(normalizedPayload) {
  const {
    bookingPipelineSnapshots,
    callBookingMetrics,
    locationPerformance,
    patientAcquisitionSnapshots,
    serviceLinePerformance,
  } = normalizedPayload.metricsInput

  return {
    bookingPipelineCount: bookingPipelineSnapshots.length,
    callBookingCount: callBookingMetrics.length,
    campaignNames: getUniqueValues([
      ...bookingPipelineSnapshots,
      ...patientAcquisitionSnapshots,
      ...callBookingMetrics,
      ...serviceLinePerformance,
    ], 'campaign_name'),
    locationPerformanceCount: locationPerformance.length,
    patientAcquisitionCount: patientAcquisitionSnapshots.length,
    periods: getUniquePeriods(normalizedPayload),
    serviceLinePerformanceCount: serviceLinePerformance.length,
  }
}

function getMetricRecordCount(summary) {
  return summary.patientAcquisitionCount
    + summary.bookingPipelineCount
    + summary.callBookingCount
    + summary.locationPerformanceCount
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
    bookingPipelineSnapshots,
    callBookingMetrics,
    locationPerformance,
    patientAcquisitionSnapshots,
    serviceLinePerformance,
  } = importPlan.normalizedPayload.metricsInput

  return {
    ...draft,
    bookingPipelineSnapshots: [
      ...bookingPipelineSnapshots,
      ...draft.bookingPipelineSnapshots,
    ],
    callBookingMetrics: [
      ...callBookingMetrics,
      ...draft.callBookingMetrics,
    ],
    locationPerformance: [
      ...locationPerformance,
      ...draft.locationPerformance,
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
