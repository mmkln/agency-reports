import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../providers/auth/useAuth'

export function createPageWrapper(PageComponent, headerComponent) {
  function PageWrapper() {
    const { runtime, onAuthChange } = useAuth()
    const [searchParams] = useSearchParams()

    const routeParams = Object.fromEntries(searchParams.entries())

    return (
      <PageComponent
        header={headerComponent}
        onAuthChange={onAuthChange}
        routeParams={routeParams}
        runtime={runtime}
      />
    )
  }

  PageWrapper.displayName = `PageWrapper(${PageComponent.displayName || PageComponent.name || 'Component'})`
  return PageWrapper
}
