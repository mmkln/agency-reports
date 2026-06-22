import { getAbsoluteAppHref, getAppHref } from '../../shared/routing'

export function buildInviteLink(token) {
  if (typeof window === 'undefined') {
    return getAppHref(`/accept-invite?token=${token}`)
  }

  return getAbsoluteAppHref(`/accept-invite?token=${token}`)
}
