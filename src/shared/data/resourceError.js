export function normalizeResourceError(error) {
  const status = Number(error?.status ?? 0) || 0
  const message = error?.message || 'Something went wrong.'

  if (status === 401 || status === 403) {
    return {
      kind: 'permission',
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
