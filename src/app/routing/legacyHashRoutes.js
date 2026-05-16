import { USER_ROLES } from '../../entities/profile'

const routeMap = {
  'accept-invite': '/accept-invite',
  'admin-client-access': '/admin/client-access',
  'admin-client-activity': '/admin/client-activity',
  'admin-client-dashboard-preview': '/admin/client-dashboard-preview',
  'admin-client-overview': '/admin/client-overview',
  'admin-client-preview': '/admin/client-preview',
  'admin-client-requests': '/admin/client-requests',
  'admin-clients': '/admin/clients',
  'admin-dashboard-links': '/admin/dashboard-links',
  'admin-reports': '/admin/reports',
  'admin-client-report-preview': '/admin/client-report-preview',
  'client-dashboard': '/client/dashboard',
  'client-requests': '/client/requests',
  'client-reports': '/client/reports',
  'legacy-build-board': '/legacy/build-board',
  'legacy-crm-dashboard': '/legacy/crm-dashboard',
  'legacy-daily-activities': '/legacy/daily-activities',
  'legacy-marketing-process': '/legacy/marketing-process',
  'legacy-marketing-reports': '/legacy/marketing-reports',
  login: '/login',
  'team-tasks': '/team/tasks',
}

function getClientOverviewPath(viewer) {
  return viewer?.role === USER_ROLES.AGENCY_ADMIN ? '/admin/client-preview' : '/client/overview'
}

export function getPathFromLegacyHash(hash, viewer) {
  const normalizedHash = String(hash ?? '').replace(/^#/, '')

  if (!normalizedHash) {
    return ''
  }

  const [legacyRoute, queryString = ''] = normalizedHash.split('?')
  const path = legacyRoute === 'client-overview'
    ? getClientOverviewPath(viewer)
    : routeMap[legacyRoute]

  if (!path) {
    return ''
  }

  return queryString ? `${path}?${queryString}` : path
}
