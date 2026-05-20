import { useSearchParams } from 'react-router-dom'

import { useAuth } from '../../../app/providers/auth/useAuth'
import { AcceptClientInvitation } from '../../../features/accept-client-invitation'

export function AcceptInvitePage({ onAuthChange, routeParams, runtime }) {
  const auth = useAuth()
  const resolvedRuntime = runtime ?? auth.runtime
  const resolvedOnAuthChange = onAuthChange ?? auth.onAuthChange
  const [searchParams] = useSearchParams()
  const resolvedRouteParams = routeParams ?? Object.fromEntries(searchParams.entries())

  return (
    <AcceptClientInvitation
      onAuthChange={resolvedOnAuthChange}
      runtime={resolvedRuntime}
      token={resolvedRouteParams.token ?? ''}
    />
  )
}
