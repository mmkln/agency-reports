import { useSearchParams } from 'react-router-dom'

import { AcceptWorkspaceInvitation } from '@/features/accept-workspace-invitation'

import { useAuth } from '../../../app/providers/auth/useAuth'

export function AcceptInvitePage() {
  const auth = useAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''

  return <AcceptWorkspaceInvitation auth={auth} token={token} />
}
