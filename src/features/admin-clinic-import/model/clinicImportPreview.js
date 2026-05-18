export function parseClinicImportJson(rawJson, fieldLabel) {
  const normalizedRawJson = String(rawJson ?? '').trim()

  if (!normalizedRawJson) {
    throw new Error(`${fieldLabel} JSON is required.`)
  }

  try {
    return JSON.parse(normalizedRawJson)
  } catch {
    throw new Error(`${fieldLabel} JSON is not valid JSON.`)
  }
}

export function getClinicImportSectionCounts(normalizedPayload) {
  return {
    compliance: normalizedPayload.complianceInput.complianceReviews.length,
    metrics: normalizedPayload.metricsInput.patientAcquisitionSnapshots.length
      + normalizedPayload.metricsInput.callBookingMetrics.length
      + normalizedPayload.metricsInput.serviceLinePerformance.length,
    reputation: normalizedPayload.reputationInput.reputationSnapshots.length,
  }
}

function getOtherSectionLabels(sectionCounts, currentSection) {
  return Object.entries(sectionCounts)
    .filter(([sectionName, count]) => sectionName !== currentSection && count > 0)
    .map(([sectionName, count]) => `${count} ${sectionName}`)
}

export function assertImportHasCurrentSectionRecords({
  currentSection,
  normalizedPayload,
  recordCount,
  recordLabel,
}) {
  if (recordCount > 0) {
    return
  }

  const otherSectionLabels = getOtherSectionLabels(
    getClinicImportSectionCounts(normalizedPayload),
    currentSection,
  )

  if (otherSectionLabels.length > 0) {
    throw new Error(
      `No ${recordLabel} records were found. This JSON contains ${otherSectionLabels.join(', ')} records; use the matching admin workspace or add ${recordLabel} records.`,
    )
  }

  throw new Error(`No ${recordLabel} records were found in this JSON.`)
}

export function getIgnoredSectionWarnings({ currentSection, normalizedPayload }) {
  return getOtherSectionLabels(
    getClinicImportSectionCounts(normalizedPayload),
    currentSection,
  ).map((sectionLabel) => (
    `This import also contains ${sectionLabel} records. They will be ignored in this workspace.`
  ))
}
