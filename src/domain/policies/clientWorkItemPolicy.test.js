import { describe, expect, it } from 'vitest'

import { CLIENT_WORK_ITEM_PUBLISH_STATES } from '../../entities/client-work-item'
import { USER_ROLES } from '../../entities/profile'
import {
  canAgencyViewClientWorkItem,
  canClientViewClientWorkItem,
  canManageClientWorkItem,
  canPublishClientWorkItem,
  canTeamPrepareClientWorkItem,
  canTransitionClientWorkItemPublishState,
} from './clientWorkItemPolicy'

const IDS = Object.freeze({
  AGENCY: 'agency-a',
  CLIENT: 'client-a',
  OTHER_CLIENT: 'client-b',
})

function createItem(overrides = {}) {
  return {
    client_id: IDS.CLIENT,
    id: 'work-item',
    publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
    ...overrides,
  }
}

describe('clientWorkItemPolicy', () => {
  it('lets client users see only their own published work items', () => {
    const viewer = {
      clientIds: [IDS.CLIENT],
      role: USER_ROLES.CLIENT_USER,
    }

    expect(canClientViewClientWorkItem({
      item: createItem(),
      viewer,
    })).toBe(true)

    expect(canClientViewClientWorkItem({
      item: createItem({ publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT }),
      viewer,
    })).toBe(false)

    expect(canClientViewClientWorkItem({
      item: createItem({ client_id: IDS.OTHER_CLIENT }),
      viewer,
    })).toBe(false)
  })

  it('lets agency admins and assigned team members view agency work items', () => {
    expect(canAgencyViewClientWorkItem({
      item: createItem(),
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
      },
    })).toBe(true)

    expect(canAgencyViewClientWorkItem({
      item: createItem(),
      viewer: {
        clientIds: [IDS.CLIENT],
        role: USER_ROLES.AGENCY_TEAM,
      },
    })).toBe(true)
  })

  it('allows only agency admins to manage and publish by default', () => {
    const item = createItem()
    const client = {
      agency_id: IDS.AGENCY,
      id: IDS.CLIENT,
    }
    const admin = {
      agencyId: IDS.AGENCY,
      role: USER_ROLES.AGENCY_ADMIN,
    }
    const team = {
      clientIds: [IDS.CLIENT],
      role: USER_ROLES.AGENCY_TEAM,
    }

    expect(canManageClientWorkItem({ client, item, viewer: admin })).toBe(true)
    expect(canPublishClientWorkItem({ client, item, viewer: admin })).toBe(true)
    expect(canManageClientWorkItem({ client, item, viewer: team })).toBe(false)
    expect(canPublishClientWorkItem({ client, item, viewer: team })).toBe(false)
    expect(canTeamPrepareClientWorkItem({ item, viewer: team })).toBe(true)
  })

  it('enforces publish state transitions', () => {
    expect(canTransitionClientWorkItemPublishState(
      CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
      CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
    )).toBe(true)
    expect(canTransitionClientWorkItemPublishState(
      CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
      CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
    )).toBe(true)
    expect(canTransitionClientWorkItemPublishState(
      CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
      CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
    )).toBe(false)
  })
})
