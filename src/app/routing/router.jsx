import { createBrowserRouter, Navigate } from 'react-router-dom'
import { getAppBasename } from '../../shared/routing'
import { RootLayout } from '../layout/RootLayout'
import { createRouteChildren } from './routeDefinitions'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <div className="p-6 text-destructive">Page not found</div>,
      children: createRouteChildren(),
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ],
  { basename: getAppBasename() || undefined },
)

