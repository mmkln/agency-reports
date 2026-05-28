import { createBrowserRouter } from 'react-router-dom'
import { getAppBasename } from '../../shared/routing'
import { RootLayout } from '../layout/RootLayout'
import { createRouteChildren } from './routeDefinitions'
import { TechnicalErrorPage } from '../../pages/system/technical-error/TechnicalErrorPage'
import { NotFoundRoute } from '../../pages/system/technical-error/NotFoundRoute'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <TechnicalErrorPage />,
      children: createRouteChildren(),
    },
    {
      path: '*',
      element: <NotFoundRoute />,
      errorElement: <TechnicalErrorPage />,
    },
  ],
  { basename: getAppBasename() || undefined },
)

