export const ROUTE_PATHS = Object.freeze({
  accountSettings: '/account/settings',

  agencyClients: '/agency/clients',
  agencyClientDetail: '/agency/clients/:clientId',
  agencyWorkspaces: '/agency/workspaces',
  agencyClientAccess: '/agency/client-access',

  portalGrowthReview: '/portal/growth-review',
  portalSettings: '/portal/settings',
})

export const LEGACY_ROUTE_REDIRECTS = Object.freeze({
  '/admin/clients': ROUTE_PATHS.agencyClients,
  '/admin/workspaces': ROUTE_PATHS.agencyWorkspaces,
  '/admin/client-access': ROUTE_PATHS.agencyClientAccess,
  '/admin/clinic-setup': ROUTE_PATHS.agencyClientAccess,
  '/admin/clinic-data-sources': ROUTE_PATHS.agencyClientAccess,
  '/admin/clinic-review': ROUTE_PATHS.portalGrowthReview,
  '/admin/clinic-review-setup': ROUTE_PATHS.agencyClientAccess,

  '/client/growth-review': ROUTE_PATHS.portalGrowthReview,
  '/client/settings': ROUTE_PATHS.portalSettings,
})

export function getCanonicalRoutePath(pathname) {
  return LEGACY_ROUTE_REDIRECTS[pathname] ?? pathname
}

export function getAgencyClientDetailPath(clientId) {
  return `/agency/clients/${clientId}`
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
