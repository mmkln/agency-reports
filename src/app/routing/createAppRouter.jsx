import { createBrowserRouter, createHashRouter } from 'react-router-dom'

import { getAppBasename, getRoutingMode, ROUTING_MODES } from '../../shared/routing'

export function createAppRouter(routes) {
  if (getRoutingMode() === ROUTING_MODES.HASH) {
    return createHashRouter(routes)
  }

  return createBrowserRouter(routes, {
    basename: getAppBasename() || undefined,
  })
}
