import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { matchPath } from 'react-router-dom'

import { CLINIC_REPORTING_CAPABILITIES } from '../../entities/profile'
import {
  getWorkspaceMembershipCapabilities,
  WORKSPACE_ROLES,
} from '../../entities/workspace-membership'
import { getPostLoginHref } from './postLoginRedirect'
import { canAccessRouteWithContext } from './roleAccess'
import { findRouteAccessMetadataByPath } from './routeAccessMetadata'

const ORIGINAL_WINDOW = globalThis.window

function createViewer({
  capabilities = [CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW],
  role = WORKSPACE_ROLES.OWNER,
} = {}) {
  return {
    activeWorkspaceId: 'workspace_1',
    agencyMemberships: [],
    managedWorkspaceRelationships: [],
    userId: 'user_1',
    workspaceMemberships: [{
      capabilities,
      role,
      status: 'active',
      workspaceId: 'workspace_1',
    }],
  }
}

function canViewerAccessHref(href, viewer) {
  const parsedUrl = new URL(href, window.location.origin)
  const route = findRouteAccessMetadataByPath(parsedUrl.pathname)

  if (!route) {
    return false
  }

  return canAccessRouteWithContext(viewer, route, {
    defaultClientId: viewer.activeWorkspaceId,
    routeParams: {
      ...(matchPath({ end: true, path: route.path }, parsedUrl.pathname)?.params ?? {}),
      ...Object.fromEntries(parsedUrl.searchParams.entries()),
    },
  })
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
    })).toBe('/portal/workspaces/workspace_1/review')
  })

  it('falls back for external next hrefs', () => {
    expect(getPostLoginHref({
      nextHref: 'https://example.com/client/growth-review?clientId=workspace_1',
      viewer: createViewer(),
    })).toBe('/portal/workspaces/workspace_1/review')
  })

  it('falls back when next href targets the public landing route', () => {
    expect(getPostLoginHref({
      nextHref: '/',
      viewer: createViewer(),
    })).toBe('/portal/workspaces/workspace_1/review')
  })

  it('falls back when next href targets the login route', () => {
    expect(getPostLoginHref({
      nextHref: '/login',
      viewer: createViewer(),
    })).toBe('/portal/workspaces/workspace_1/review')
  })

  it('keeps a safe accessible workspace path-param next href', () => {
    expect(getPostLoginHref({
      nextHref: '/portal/workspaces/workspace_1/review',
      viewer: createViewer(),
    })).toBe('/portal/workspaces/workspace_1/review')
  })

  it('routes invited workspace viewers to Growth Review after login', () => {
    const viewer = createViewer({
      capabilities: getWorkspaceMembershipCapabilities({ role: WORKSPACE_ROLES.VIEWER }),
      role: WORKSPACE_ROLES.VIEWER,
    })
    const href = getPostLoginHref({
      nextHref: '/portal/workspaces/workspace_1/review',
      viewer,
    })

    expect(href).toBe('/portal/workspaces/workspace_1/review')
    expect(canViewerAccessHref(href, viewer)).toBe(true)
  })
})
