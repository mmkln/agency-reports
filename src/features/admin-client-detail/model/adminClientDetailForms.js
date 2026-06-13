import { WORKSPACE_CLIENT_ACCESS_POLICIES } from '@/entities/workspace'
import { WORKSPACE_ROLES } from '@/entities/workspace-membership'

export function createInviteClientUserForm() {
  return {
    email: '',
    name: '',
    role: WORKSPACE_ROLES.VIEWER,
  }
}

export function createWorkspaceForm() {
  return {
    clientAccessPolicy: WORKSPACE_CLIENT_ACCESS_POLICIES.OWNERS_ADMINS,
    name: '',
    type: 'clinic',
  }
}

export function createEditClientForm(client) {
  return {
    clientId: client?.id ?? '',
    name: client?.name ?? '',
    status: client?.status ?? 'active',
  }
}

export function createClientEditPayload({ name, status }) {
  return {
    name,
    status,
  }
}

export function createWorkspaceInvitationPayload({ email, name, role }) {
  return {
    email,
    name,
    role,
  }
}

export function createWorkspacePayload({ agencyId, clientId, form, name }) {
  return {
    agency_id: agencyId,
    client_access_policy: form.clientAccessPolicy,
    client_id: clientId,
    name,
    type: form.type,
  }
}
