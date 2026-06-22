import { useState } from 'react'

import {
  listWorkspaceMemberships,
  removeWorkspaceMembership,
} from '@/entities/workspace-membership'

import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'

function normalizeWorkspaceMembership(source = {}) {
  return {
    createdAt: source.created_at ?? source.createdAt ?? '',
    email: source.email ?? '',
    id: String(source.id ?? ''),
    name: source.name ?? '',
    removedAt: source.removed_at ?? source.removedAt ?? '',
    role: source.role ?? '',
    status: source.status ?? 'active',
    updatedAt: source.updated_at ?? source.updatedAt ?? '',
    userId: String(source.user_id ?? source.userId ?? ''),
    workspaceId: String(source.workspace_id ?? source.workspaceId ?? ''),
  }
}

function normalizeWorkspaceMembershipsPayload(payload = {}) {
  const memberships = payload.memberships ?? payload

  if (!Array.isArray(memberships)) {
    return []
  }

  return memberships.map(normalizeWorkspaceMembership)
}

export function useAccessMembersPanel({ workspaceId, runtime }) {
  const toast = useToast()
  const [memberPendingRemoval, setMemberPendingRemoval] = useState(null)
  const membersResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:workspace-members:${workspaceId ?? ''}`,
    initialData: [],
    load: () => {
      if (!workspaceId) {
        return Promise.resolve([])
      }

      return listWorkspaceMemberships(runtime.apiClient, workspaceId)
        .then(normalizeWorkspaceMembershipsPayload)
    },
  })
  const members = membersResource.data ?? []
  const activeMembers = members.filter((member) => member.status === 'active')
  const memberHistory = members.filter((member) => member.status !== 'active')

  function refreshMembers() {
    void membersResource.reload()
  }

  function removeMember() {
    if (!memberPendingRemoval) {
      return
    }

    void removeWorkspaceMembership(runtime.apiClient, workspaceId, memberPendingRemoval.id).then(() => {
      const removedMemberName = memberPendingRemoval.name
      setMemberPendingRemoval(null)
      refreshMembers()
      toast.success('Member removed', `${removedMemberName} no longer has access to this workspace.`)
    }).catch((caughtError) => {
      toast.error('Member was not removed', caughtError.message)
    })
  }

  return {
    activeMembers,
    error: membersResource.error ?? '',
    memberHistory,
    memberPendingRemoval,
    removeMember,
    setMemberPendingRemoval,
    status: membersResource.status,
  }
}
