export function buildInviteLink(token) {
  if (typeof window === 'undefined') {
    return `/accept-invite?token=${token}`
  }

  return `${window.location.origin}${import.meta.env.BASE_URL}accept-invite?token=${token}`
}
