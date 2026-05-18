import { normalizeClinicImportPayload } from '../../../domain/services/clinicImportContractService'
import {
  assertImportHasCurrentSectionRecords,
  getIgnoredSectionWarnings,
  parseClinicImportJson,
} from '../../admin-clinic-import'

function getUniqueValues(records, fieldName) {
  return [...new Set(records.map((record) => record[fieldName]).filter(Boolean))].sort()
}

function summarizeClinicComplianceImport(normalizedPayload) {
  const complianceReviews = normalizedPayload.complianceInput.complianceReviews

  return {
    complianceReviewCount: complianceReviews.length,
    platforms: getUniqueValues(complianceReviews, 'platform'),
    statuses: getUniqueValues(complianceReviews, 'status'),
  }
}

export function previewClinicComplianceImport({ clientId, rawJson, now }) {
  const parsedPayload = parseClinicImportJson(rawJson, 'Clinic compliance')
  const normalizedPayload = normalizeClinicImportPayload(parsedPayload, { now })

  if (normalizedPayload.clientId !== clientId) {
    throw new Error('Imported clinic compliance belongs to a different client workspace.')
  }

  const summary = summarizeClinicComplianceImport(normalizedPayload)

  assertImportHasCurrentSectionRecords({
    currentSection: 'compliance',
    normalizedPayload,
    recordCount: summary.complianceReviewCount,
    recordLabel: 'clinic compliance',
  })

  return {
    contractVersion: normalizedPayload.contractVersion,
    normalizedPayload,
    summary,
    warnings: getIgnoredSectionWarnings({
      currentSection: 'compliance',
      normalizedPayload,
    }),
  }
}

export function applyClinicComplianceImportToDraft({ draft, importPlan }) {
  if (!draft) {
    throw new Error('Clinic compliance draft is not available.')
  }

  if (!importPlan?.normalizedPayload?.complianceInput) {
    throw new Error('Preview the clinic compliance import before applying it.')
  }

  return {
    ...draft,
    complianceReviews: [
      ...importPlan.normalizedPayload.complianceInput.complianceReviews,
      ...draft.complianceReviews,
    ],
  }
}
