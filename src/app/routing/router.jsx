import { RootLayout } from '../layout/RootLayout'
import { createAppRouter } from './createAppRouter'
import { createRouteChildren } from './routeDefinitions'
import { TechnicalErrorPage } from '../../pages/system/technical-error/TechnicalErrorPage'
import { NotFoundRoute } from '../../pages/system/technical-error/NotFoundRoute'

export const router = createAppRouter(
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
)

