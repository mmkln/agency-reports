export const AGENCY_WORKSPACE_RELATIONSHIP_STATUSES = Object.freeze({
  ACTIVE: 'active',
  ENDED: 'ended',
  PAUSED: 'paused',
})

export function isActiveAgencyWorkspaceRelationship(relationship) {
  return relationship?.status === AGENCY_WORKSPACE_RELATIONSHIP_STATUSES.ACTIVE
}

