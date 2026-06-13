import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { CLINIC_REPORTING_CAPABILITIES } from '../../entities/profile'
import { getPostLoginHref } from './postLoginRedirect'

const ORIGINAL_WINDOW = globalThis.window

function createViewer() {
  return {
    activeWorkspaceId: 'workspace_1',
    agencyMemberships: [],
    managedWorkspaceRelationships: [],
    userId: 'user_1',
    workspaceMemberships: [{
      capabilities: [CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW],
      role: 'owner',
      status: 'active',
      workspaceId: 'workspace_1',
    }],
  }
}

describe('getPostLoginHref', () => {
  beforeEach(() => {
    globalThis.window = {
      location: {
        origin: 'http://localhost:5173',
      },
    }
  })

  afterEach(() => {
    globalThis.window = ORIGINAL_WINDOW
  })

  it('keeps a safe accessible next href', () => {
    expect(getPostLoginHref({
      nextHref: '/portal/growth-review?clientId=workspace_1',
      viewer: createViewer(),
    })).toBe('/portal/growth-review?clientId=workspace_1')
  })

  it('normalizes legacy next hrefs to canonical routes', () => {
    expect(getPostLoginHref({
      nextHref: '/client/growth-review?clientId=workspace_1',
      viewer: createViewer(),
    })).toBe('/portal/growth-review?clientId=workspace_1')
  })

  it('falls back when next href targets a denied workspace', () => {
    expect(getPostLoginHref({
      nextHref: '/portal/growth-review?clientId=workspace_2',
      viewer: createViewer(),
    })).toBe('/portal/growth-review?clientId=workspace_1')
  })

  it('falls back for external next hrefs', () => {
    expect(getPostLoginHref({
      nextHref: 'https://example.com/client/growth-review?clientId=workspace_1',
      viewer: createViewer(),
    })).toBe('/portal/growth-review?clientId=workspace_1')
  })

  it('falls back when next href targets the public landing route', () => {
    expect(getPostLoginHref({
      nextHref: '/',
      viewer: createViewer(),
    })).toBe('/portal/growth-review?clientId=workspace_1')
  })

  it('falls back when next href targets the login route', () => {
    expect(getPostLoginHref({
      nextHref: '/login',
      viewer: createViewer(),
    })).toBe('/portal/growth-review?clientId=workspace_1')
  })
})
