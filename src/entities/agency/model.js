export const AGENCY_STATUSES = Object.freeze({
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  PAUSED: 'paused',
})

export function isActiveAgency(agency) {
  return agency?.status !== AGENCY_STATUSES.ARCHIVED
}

