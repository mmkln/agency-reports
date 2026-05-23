import { describe, expect, it } from 'vitest'

import {
  createSeedDataForRepositoryContract,
  runPortalRepositoryContractSuite,
} from './portalRepositoryContract.test-support'
import {
  createPortalRepositoryFromSnapshot,
  createPortalSeedSnapshot,
  normalizePortalSnapshot,
  PORTAL_STORAGE_SCHEMA_VERSION,
} from './createSnapshotPortalRepository'

runPortalRepositoryContractSuite({
  createRepository: () => createPortalRepositoryFromSnapshot({
    seedData: createSeedDataForRepositoryContract(),
    snapshot: null,
  }).repositories,
  name: 'snapshot-backed',
})

describe('createSnapshotPortalRepository', () => {
  it('normalizes missing and malformed snapshots against the repository table contract', () => {
    const seedData = createSeedDataForRepositoryContract({
      workspaces: [
        {
          agency_id: 'agency-1',
          id: 'seed-workspace',
          name: 'Seed Workspace',
        },
      ],
    })

    expect(createPortalSeedSnapshot(seedData).__schemaVersion).toBe(PORTAL_STORAGE_SCHEMA_VERSION)
    expect(normalizePortalSnapshot(null, seedData).workspaces).toEqual([
      expect.objectContaining({ id: 'seed-workspace' }),
    ])
    expect(normalizePortalSnapshot({ workspaces: [] }, seedData).workspaces).toEqual([
      expect.objectContaining({ id: 'seed-workspace' }),
    ])
  })

  it('exposes the current normalized snapshot after repository writes', () => {
    const workspace = createPortalRepositoryFromSnapshot({
      seedData: createSeedDataForRepositoryContract(),
      snapshot: null,
      version: 'snapshot-version-1',
    })

    workspace.repositories.clients.upsert({
      agency_id: 'agency-1',
      id: 'client-1',
      name: 'Client 1',
    })

    expect(workspace.getSnapshot()).toMatchObject({
      __schemaVersion: PORTAL_STORAGE_SCHEMA_VERSION,
      workspaces: [
        expect.objectContaining({
          id: 'client-1',
        }),
      ],
    })
    expect(workspace.version).toBe('snapshot-version-1')
  })

  it('exposes workspace adapters over current workspace storage', () => {
    const workspace = createPortalRepositoryFromSnapshot({
      seedData: createSeedDataForRepositoryContract(),
      snapshot: null,
    })

    workspace.repositories.workspaces.upsert({
      agency_id: 'agency-1',
      id: 'workspace-1',
      name: 'Workspace 1',
    })
    workspace.repositories.workspaceMemberships.upsert({
      id: 'workspace-membership-1',
      role: 'workspace_viewer',
      user_id: 'user-1',
      workspace_id: 'workspace-1',
    })

    expect(workspace.repositories.workspaces.findById('workspace-1')).toMatchObject({
      id: 'workspace-1',
      name: 'Workspace 1',
    })
    expect(workspace.repositories.workspaceMemberships.listByWorkspaceId('workspace-1')).toEqual([
      expect.objectContaining({
        client_id: 'workspace-1',
        workspace_id: 'workspace-1',
      }),
    ])
    expect(workspace.getSnapshot().workspace_memberships).toEqual([
      expect.objectContaining({
        client_id: 'workspace-1',
        id: 'workspace-membership-1',
      }),
    ])
  })

  it('migrates legacy client access tables into workspace access tables', () => {
    const workspace = createPortalRepositoryFromSnapshot({
      seedData: createSeedDataForRepositoryContract(),
      snapshot: {
        client_invitations: [{
          client_id: 'workspace-1',
          email: 'owner@example.com',
          id: 'legacy-invite-1',
        }],
        client_memberships: [{
          client_id: 'workspace-1',
          id: 'legacy-membership-1',
          role: 'owner',
          user_id: 'user-1',
        }],
      },
    })

    expect(workspace.repositories.workspaceInvitations.findById('legacy-invite-1')).toMatchObject({
      client_id: 'workspace-1',
      id: 'legacy-invite-1',
    })
    expect(workspace.repositories.workspaceMemberships.findById('legacy-membership-1')).toMatchObject({
      client_id: 'workspace-1',
      role: 'workspace_owner',
      workspace_id: 'workspace-1',
    })
    expect(workspace.getSnapshot().client_invitations).toBeUndefined()
    expect(workspace.getSnapshot().client_memberships).toBeUndefined()
  })

  it('migrates legacy clients table into workspace storage', () => {
    const workspace = createPortalRepositoryFromSnapshot({
      seedData: createSeedDataForRepositoryContract(),
      snapshot: {
        clients: [{
          agency_id: 'agency-1',
          id: 'legacy-client-1',
          name: 'Legacy Client',
        }],
      },
    })

    expect(workspace.repositories.workspaces.findById('legacy-client-1')).toMatchObject({
      id: 'legacy-client-1',
      name: 'Legacy Client',
    })
    expect(workspace.repositories.clients.findById('legacy-client-1')).toMatchObject({
      id: 'legacy-client-1',
      name: 'Legacy Client',
    })
    expect(workspace.getSnapshot().workspaces).toEqual([
      expect.objectContaining({ id: 'legacy-client-1' }),
    ])
    expect(workspace.getSnapshot().clients).toBeUndefined()
  })
})
