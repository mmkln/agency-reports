import { AGENCY_CAPABILITIES, getAgencyMembershipCapabilities } from '@/entities/agency-membership'

function getClientAgencyMembership(viewer, client) {
  return (viewer?.agencyMemberships ?? []).find((membership) => membership.agencyId === client.agencyId) ?? null
}

function hasAgencyCapability(viewer, client, capability) {
  const membership = getClientAgencyMembership(viewer, client)
  return getAgencyMembershipCapabilities(membership).includes(capability)
}

export function getClientActionPermissions(viewer, client) {
  return {
    canAddWorkspace: hasAgencyCapability(viewer, client, AGENCY_CAPABILITIES.CREATE_WORKSPACE),
    canEditClient: hasAgencyCapability(viewer, client, AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS),
    canInviteClientUser: hasAgencyCapability(viewer, client, AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS),
    canOpenClient: hasAgencyCapability(viewer, client, AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS),
  }
}
