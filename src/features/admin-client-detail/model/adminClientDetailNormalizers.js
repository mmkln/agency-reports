import { normalizeBackendClient } from '@/entities/client'

export function normalizeAdminClientDetailClient(payload = {}) {
  return normalizeBackendClient(payload.client)
}

export function normalizeWorkspaceMembership(source = {}) {
  return {
    createdAt: source.created_at ?? source.createdAt ?? '',
    email: source.email ?? '',
    id: String(source.id ?? ''),
    name: source.name ?? '',
    role: source.role ?? '',
    status: source.status ?? 'active',
    userId: String(source.user_id ?? source.userId ?? ''),
    workspaceId: String(source.workspace_id ?? source.workspaceId ?? ''),
  }
}

export function normalizeWorkspaceMembershipsPayload(payload = {}) {
  return (payload.memberships ?? []).map(normalizeWorkspaceMembership)
}

export function normalizeWorkspaceInvitation(source = {}) {
  return {
    createdAt: source.created_at ?? source.createdAt ?? '',
    email: source.email ?? '',
    expiresAt: source.expires_at ?? source.expiresAt ?? '',
    id: String(source.id ?? ''),
    makeDeliveryError: source.make_delivery_error ?? source.makeDeliveryError ?? '',
    makeDeliveryStatus: source.make_delivery_status ?? source.makeDeliveryStatus ?? 'pending',
    name: source.name ?? '',
    role: source.role ?? '',
    sentCount: Number(source.sent_count ?? source.sentCount ?? 0),
    status: source.status ?? 'pending',
  }
}

export function normalizeWorkspaceInvitationsPayload(payload = {}) {
  return (payload.invitations ?? []).map(normalizeWorkspaceInvitation)
}
