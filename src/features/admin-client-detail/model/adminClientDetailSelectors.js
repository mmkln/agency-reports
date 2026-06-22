export function getPrimaryAgencyId(viewer) {
  return viewer?.activeAgencyId ?? viewer?.agencyMemberships?.[0]?.agencyId ?? ''
}

export function getPrimaryWorkspace(client) {
  return (client?.workspaces ?? []).find((workspace) => workspace.status === 'active')
    ?? client?.workspaces?.[0]
    ?? null
}

export function selectActiveWorkspaceMemberships(memberships = []) {
  return memberships.filter((membership) => membership.status === 'active')
}

export function selectPendingWorkspaceInvitations(invitations = []) {
  return invitations.filter((invitation) => invitation.status === 'pending')
}
