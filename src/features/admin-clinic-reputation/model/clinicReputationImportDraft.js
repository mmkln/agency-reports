import { normalizeClinicImportPayload } from '../../../domain/services/clinicImportContractService'

function parseJson(rawJson) {
  const normalizedRawJson = String(rawJson ?? '').trim()

  if (!normalizedRawJson) {
    throw new Error('Clinic reputation JSON is required.')
  }

  try {
    return JSON.parse(normalizedRawJson)
  } catch {
    throw new Error('Clinic reputation JSON is not valid JSON.')
  }
}

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
  const parsedPayload = parseJson(rawJson)
  const normalizedPayload = normalizeClinicImportPayload(parsedPayload, { now })

  if (normalizedPayload.clientId !== clientId) {
    throw new Error('Imported clinic reputation belongs to a different client workspace.')
  }

  return {
    contractVersion: normalizedPayload.contractVersion,
    normalizedPayload,
    summary: summarizeClinicReputationImport(normalizedPayload),
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
