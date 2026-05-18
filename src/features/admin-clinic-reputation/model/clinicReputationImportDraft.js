import { normalizeClinicImportPayload } from '../../../domain/services/clinicImportContractService'
import {
  assertImportHasCurrentSectionRecords,
  getIgnoredSectionWarnings,
  parseClinicImportJson,
} from '../../admin-clinic-import'

function getUniquePeriods(reputationSnapshots) {
  return [...new Set(reputationSnapshots.map((record) => record.period_label).filter(Boolean))].sort()
}

function summarizeClinicReputationImport(normalizedPayload) {
  const reputationSnapshots = normalizedPayload.reputationInput.reputationSnapshots

  return {
    periods: getUniquePeriods(reputationSnapshots),
    reputationSnapshotCount: reputationSnapshots.length,
  }
}

export function previewClinicReputationImport({ clientId, rawJson, now }) {
  const parsedPayload = parseClinicImportJson(rawJson, 'Clinic reputation')
  const normalizedPayload = normalizeClinicImportPayload(parsedPayload, { now })

  if (normalizedPayload.clientId !== clientId) {
    throw new Error('Imported clinic reputation belongs to a different client workspace.')
  }

  const summary = summarizeClinicReputationImport(normalizedPayload)

  assertImportHasCurrentSectionRecords({
    currentSection: 'reputation',
    normalizedPayload,
    recordCount: summary.reputationSnapshotCount,
    recordLabel: 'clinic reputation',
  })

  return {
    contractVersion: normalizedPayload.contractVersion,
    normalizedPayload,
    summary,
    warnings: getIgnoredSectionWarnings({
      currentSection: 'reputation',
      normalizedPayload,
    }),
  }
}

export function applyClinicReputationImportToDraft({ draft, importPlan }) {
  if (!draft) {
    throw new Error('Clinic reputation draft is not available.')
  }

  if (!importPlan?.normalizedPayload?.reputationInput) {
    throw new Error('Preview the clinic reputation import before applying it.')
  }

  return {
    ...draft,
    reputationSnapshots: [
      ...importPlan.normalizedPayload.reputationInput.reputationSnapshots,
      ...draft.reputationSnapshots,
    ],
  }
}
