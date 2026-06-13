import { CLIENT_INVITATION_STATUSES } from '../../entities/client-invitation'
import { getPortalWorkspaceReviewPath, ROUTE_PATHS } from '../../domain/navigation/routePaths'

export const REDIRECT_DELAY_MS = 1000

export function getLoginHref(token) {
  return `/login?next=${encodeURIComponent(`/accept-invite?token=${token}`)}`
}

export function getPostAcceptLoginHref(workspaceId) {
  const nextHref = workspaceId ? getPortalWorkspaceReviewPath(workspaceId) : ROUTE_PATHS.portalHome

  return `/login?next=${encodeURIComponent(nextHref)}`
}

export function formatInvitationDate(value) {
  if (!value) {
    return 'No expiration'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function getInactiveInvitationCopy(status) {
  if (status === CLIENT_INVITATION_STATUSES.EXPIRED) {
    return {
      description: 'Ask the agency team to resend the invite.',
      iconName: 'clock',
      title: 'Invitation expired',
    }
  }

  if (status === CLIENT_INVITATION_STATUSES.CANCELLED) {
    return {
      description: 'This invite can no longer be accepted.',
      iconName: 'circleX',
      title: 'Invitation cancelled',
    }
  }

  if (status === CLIENT_INVITATION_STATUSES.ACCEPTED) {
    return {
      description: 'Sign in to open your portal.',
      iconName: 'checkCircle2',
      title: 'Invitation already accepted',
    }
  }

  return {
    description: 'Use the latest invite link from your agency team.',
    iconName: 'circleAlert',
    title: 'Invitation unavailable',
  }
}
