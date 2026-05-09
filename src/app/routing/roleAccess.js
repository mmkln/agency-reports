export function canAccessRoute(viewer, route) {
  if (!route?.allowedRoles?.length) {
    return true
  }

  return route.allowedRoles.includes(viewer?.role)
}

export function filterRoutesForViewer(routes, viewer) {
  return routes.filter((route) => canAccessRoute(viewer, route))
}
