export const ROUTE_PATHS = Object.freeze({
  accountSettings: '/account/settings',

  agencyClients: '/agency/clients',
  agencyClientDetail: '/agency/clients/:clientId',
  agencyWorkspaces: '/agency/workspaces',
  agencyClientAccess: '/agency/client-access',
  agencyWorkspaceDetail: '/agency/workspaces/:workspaceId',
  agencyWorkspaceSetup: '/agency/workspaces/:workspaceId/setup',
  agencyWorkspaceData: '/agency/workspaces/:workspaceId/data',
  agencyWorkspaceTagCatalog: '/agency/workspaces/:workspaceId/tag-catalog',
  agencyWorkspaceReviewSetup: '/agency/workspaces/:workspaceId/review-setup',
  agencyWorkspaceReview: '/agency/workspaces/:workspaceId/review',
  agencyWorkspaceExecutive: '/agency/workspaces/:workspaceId/executive',
  agencyWorkspaceAccess: '/agency/workspaces/:workspaceId/access',

  portalHome: '/portal',
  portalGrowthReview: '/portal/growth-review',
  portalExecutive: '/portal/executive',
  portalWorkspaceDetail: '/portal/workspaces/:workspaceId',
  portalWorkspaceReview: '/portal/workspaces/:workspaceId/review',
  portalWorkspaceExecutive: '/portal/workspaces/:workspaceId/executive',
  portalSettings: '/portal/settings',
})

export const LEGACY_ROUTE_REDIRECTS = Object.freeze({
  '/admin/clients': ROUTE_PATHS.agencyClients,
  '/admin/workspaces': ROUTE_PATHS.agencyWorkspaces,
  '/admin/client-access': ROUTE_PATHS.agencyClientAccess,

  '/client/growth-review': ROUTE_PATHS.portalGrowthReview,
  '/client/settings': ROUTE_PATHS.portalSettings,
})

export function getCanonicalRoutePath(pathname) {
  return LEGACY_ROUTE_REDIRECTS[pathname] ?? pathname
}

export function getAgencyClientDetailPath(clientId) {
  return `/agency/clients/${clientId}`
}

function buildPath(pattern, params = {}) {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(String(value))),
    pattern,
  )
}

export function getAgencyWorkspaceSetupPath(workspaceId) {
  return buildPath(ROUTE_PATHS.agencyWorkspaceSetup, { workspaceId })
}

export function getAgencyWorkspaceDataPath(workspaceId) {
  return buildPath(ROUTE_PATHS.agencyWorkspaceData, { workspaceId })
}

export function getAgencyWorkspaceTagCatalogPath(workspaceId) {
  return buildPath(ROUTE_PATHS.agencyWorkspaceTagCatalog, { workspaceId })
}

export function getAgencyWorkspaceReviewSetupPath(workspaceId) {
  return buildPath(ROUTE_PATHS.agencyWorkspaceReviewSetup, { workspaceId })
}

export function getAgencyWorkspaceReviewPath(workspaceId) {
  return buildPath(ROUTE_PATHS.agencyWorkspaceReview, { workspaceId })
}

export function getAgencyWorkspaceExecutivePath(workspaceId) {
  return buildPath(ROUTE_PATHS.agencyWorkspaceExecutive, { workspaceId })
}

export function getAgencyWorkspaceAccessPath(workspaceId) {
  return buildPath(ROUTE_PATHS.agencyWorkspaceAccess, { workspaceId })
}

export function getPortalWorkspaceReviewPath(workspaceId) {
  return buildPath(ROUTE_PATHS.portalWorkspaceReview, { workspaceId })
}

export function getPortalWorkspaceExecutivePath(workspaceId) {
  return buildPath(ROUTE_PATHS.portalWorkspaceExecutive, { workspaceId })
}

export function withSearchParams(path, params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const queryString = searchParams.toString()

  return queryString ? `${path}?${queryString}` : path
}
