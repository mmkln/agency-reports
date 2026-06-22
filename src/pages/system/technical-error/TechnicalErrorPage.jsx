import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { Panel, PanelBody } from '@/shared/ui'

function getTechnicalErrorMessage(error) {
  if (isRouteErrorResponse(error)) {
    return error.status === 404 ? 'Page not found.' : 'The page could not be loaded.'
  }

  return 'The page could not be loaded.'
}

export function TechnicalErrorPage() {
  const error = useRouteError()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-surface-page px-app-gutter py-section">
      <Panel className="mx-auto max-w-[520px]">
        <PanelBody className="space-y-control">
          <div>
            <p className="text-heading-sm font-semibold text-text-primary">
              Something went wrong
            </p>
            <p className="mt-tag text-ui text-text-secondary">
              {getTechnicalErrorMessage(error)}
            </p>
          </div>
        </PanelBody>
      </Panel>
    </main>
  )
}
