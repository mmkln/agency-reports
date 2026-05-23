import { describe, expect, it } from 'vitest'

import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { WORKSPACE_CAPABILITIES } from '../../entities/workspace-membership'
import {
  createAgencyAccessViewer,
  createWorkspaceAccessViewer,
} from '../test/accessViewerTestHelpers'
import {
  canAgencyProcessNeededAction,
  canClientRespondToNeededAction,
  canTransitionNeededActionStatus,
  getNeededActionStatusSelectionOptions,
  getNeededActionStatusTransitionTargets,
} from './neededActionPolicy'

describe('neededActionPolicy', () => {
  it('allows UC-005 request lifecycle transitions', () => {
    expect(canTransitionNeededActionStatus(NEEDED_ACTION_STATUSES.PENDING, NEEDED_ACTION_STATUSES.ANSWERED)).toBe(true)
    expect(canTransitionNeededActionStatus(NEEDED_ACTION_STATUSES.PENDING, NEEDED_ACTION_STATUSES.RESOLVED)).toBe(true)
    expect(canTransitionNeededActionStatus(NEEDED_ACTION_STATUSES.PENDING, NEEDED_ACTION_STATUSES.CANCELLED)).toBe(true)
    expect(canTransitionNeededActionStatus(NEEDED_ACTION_STATUSES.ANSWERED, NEEDED_ACTION_STATUSES.RESOLVED)).toBe(true)
    expect(canTransitionNeededActionStatus(NEEDED_ACTION_STATUSES.ANSWERED, NEEDED_ACTION_STATUSES.PENDING)).toBe(true)
    expect(canTransitionNeededActionStatus(NEEDED_ACTION_STATUSES.CANCELLED, NEEDED_ACTION_STATUSES.PENDING)).toBe(true)
    expect(canTransitionNeededActionStatus(NEEDED_ACTION_STATUSES.RESOLVED, NEEDED_ACTION_STATUSES.PENDING)).toBe(true)
  })

  it('blocks unsupported request lifecycle transitions', () => {
    expect(canTransitionNeededActionStatus(NEEDED_ACTION_STATUSES.RESOLVED, NEEDED_ACTION_STATUSES.CANCELLED)).toBe(false)
    expect(canTransitionNeededActionStatus(NEEDED_ACTION_STATUSES.CANCELLED, NEEDED_ACTION_STATUSES.RESOLVED)).toBe(false)
  })

  it('returns transition targets and stable selection options', () => {
    expect(getNeededActionStatusTransitionTargets(NEEDED_ACTION_STATUSES.PENDING)).toEqual([
      NEEDED_ACTION_STATUSES.ANSWERED,
      NEEDED_ACTION_STATUSES.APPROVED,
      NEEDED_ACTION_STATUSES.CHANGES_REQUESTED,
      NEEDED_ACTION_STATUSES.RESOLVED,
      NEEDED_ACTION_STATUSES.CANCELLED,
    ])

    expect(getNeededActionStatusSelectionOptions({
      currentStatus: NEEDED_ACTION_STATUSES.ANSWERED,
    })).toEqual([
      NEEDED_ACTION_STATUSES.PENDING,
      NEEDED_ACTION_STATUSES.ANSWERED,
      NEEDED_ACTION_STATUSES.APPROVED,
      NEEDED_ACTION_STATUSES.CHANGES_REQUESTED,
      NEEDED_ACTION_STATUSES.RESOLVED,
      NEEDED_ACTION_STATUSES.CANCELLED,
    ])
  })

  it('allows only client users to answer pending requests', () => {
    const workspaceViewer = createWorkspaceAccessViewer({
      capabilities: [
        WORKSPACE_CAPABILITIES.VIEW_PORTAL,
        WORKSPACE_CAPABILITIES.RESPOND_TO_ACTIONS,
      ],
      workspaceId: 'workspace-a',
    })

    expect(canClientRespondToNeededAction({
      action: { client_id: 'workspace-a', status: NEEDED_ACTION_STATUSES.PENDING },
      viewer: workspaceViewer,
    })).toBe(true)

    expect(canClientRespondToNeededAction({
      action: { client_id: 'workspace-a', status: NEEDED_ACTION_STATUSES.ANSWERED },
      viewer: workspaceViewer,
    })).toBe(false)

    expect(canClientRespondToNeededAction({
      action: { client_id: 'workspace-a', status: NEEDED_ACTION_STATUSES.PENDING },
      viewer: createAgencyAccessViewer({
        agencyId: 'agency-id',
        managedWorkspaceIds: ['workspace-a'],
      }),
    })).toBe(false)
  })

  it('allows only agency admins with an agency to process allowed transitions', () => {
    const agencyAdmin = createAgencyAccessViewer({
      agencyId: 'agency-id',
      managedWorkspaceIds: ['workspace-a'],
    })

    expect(canAgencyProcessNeededAction({
      action: { client_id: 'workspace-a', status: NEEDED_ACTION_STATUSES.ANSWERED },
      targetStatus: NEEDED_ACTION_STATUSES.RESOLVED,
      viewer: agencyAdmin,
    })).toBe(true)

    expect(canAgencyProcessNeededAction({
      action: { client_id: 'workspace-a', status: NEEDED_ACTION_STATUSES.ANSWERED },
      targetStatus: NEEDED_ACTION_STATUSES.RESOLVED,
      viewer: createAgencyAccessViewer({
        agencyId: 'agency-id',
        managedWorkspaceIds: [],
      }),
    })).toBe(false)

    expect(canAgencyProcessNeededAction({
      action: { client_id: 'workspace-a', status: NEEDED_ACTION_STATUSES.RESOLVED },
      targetStatus: NEEDED_ACTION_STATUSES.CANCELLED,
      viewer: agencyAdmin,
    })).toBe(false)
  })
})
