export function normalizeResourceError(error) {
  const status = Number(error?.status ?? 0) || 0
  const message = error?.message || 'Something went wrong.'

  if (status === 401) {
    return {
      kind: error?.code === 'session_expired' ? 'session-expired' : 'unauthenticated',
      message,
      status,
    }
  }

  if (status === 403) {
    return {
      kind: 'forbidden',
      message,
      status,
    }
  }

  if (status === 404) {
    return {
      kind: 'not-found',
      message,
      status,
    }
  }

  if (status === 400) {
    return {
      kind: 'validation',
      message,
      status,
    }
  }

  if (status === 0) {
    return {
      kind: 'network',
      message,
      status,
    }
  }

  return {
    kind: 'failure',
    message,
    status,
  }
}
