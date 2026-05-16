import { describe, expect, it } from 'vitest'

import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
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
      NEEDED_ACTION_STATUSES.RESOLVED,
      NEEDED_ACTION_STATUSES.CANCELLED,
    ])

    expect(getNeededActionStatusSelectionOptions({
      currentStatus: NEEDED_ACTION_STATUSES.ANSWERED,
    })).toEqual([
      NEEDED_ACTION_STATUSES.PENDING,
      NEEDED_ACTION_STATUSES.ANSWERED,
      NEEDED_ACTION_STATUSES.RESOLVED,
      NEEDED_ACTION_STATUSES.CANCELLED,
    ])
  })

  it('allows only client users to answer pending requests', () => {
    expect(canClientRespondToNeededAction({
      action: { status: NEEDED_ACTION_STATUSES.PENDING },
      viewer: { role: USER_ROLES.CLIENT_USER },
    })).toBe(true)

    expect(canClientRespondToNeededAction({
      action: { status: NEEDED_ACTION_STATUSES.ANSWERED },
      viewer: { role: USER_ROLES.CLIENT_USER },
    })).toBe(false)

    expect(canClientRespondToNeededAction({
      action: { status: NEEDED_ACTION_STATUSES.PENDING },
      viewer: { agencyId: 'agency-id', role: USER_ROLES.AGENCY_ADMIN },
    })).toBe(false)
  })

  it('allows only agency admins with an agency to process allowed transitions', () => {
    expect(canAgencyProcessNeededAction({
      action: { status: NEEDED_ACTION_STATUSES.ANSWERED },
      targetStatus: NEEDED_ACTION_STATUSES.RESOLVED,
      viewer: { agencyId: 'agency-id', role: USER_ROLES.AGENCY_ADMIN },
    })).toBe(true)

    expect(canAgencyProcessNeededAction({
      action: { status: NEEDED_ACTION_STATUSES.ANSWERED },
      targetStatus: NEEDED_ACTION_STATUSES.RESOLVED,
      viewer: { role: USER_ROLES.AGENCY_ADMIN },
    })).toBe(false)

    expect(canAgencyProcessNeededAction({
      action: { status: NEEDED_ACTION_STATUSES.RESOLVED },
      targetStatus: NEEDED_ACTION_STATUSES.CANCELLED,
      viewer: { agencyId: 'agency-id', role: USER_ROLES.AGENCY_ADMIN },
    })).toBe(false)
  })
})
