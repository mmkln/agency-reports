export {
  createAdminClient as createAgencyWorkspace,
  deleteAdminClient as deleteAgencyWorkspace,
  getPortalSlugIssue as getWorkspacePortalSlugIssue,
  getPortalSlugIssueFromClients as getWorkspacePortalSlugIssueFromWorkspaces,
  listAdminClientPendingInvitations as listAgencyWorkspacePendingInvitations,
  listAdminClients as listAgencyManagedWorkspaces,
  listAgencyWorkspaceClients,
  normalizePortalSlug,
  updateAdminClient as updateAgencyWorkspace,
} from './adminClientService'
