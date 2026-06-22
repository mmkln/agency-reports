export function createBearerAuthInterceptor({
  getToken,
  shouldAttach = ({ options }) => !options.skipAuth,
} = {}) {
  return ({ headers, options }) => {
    if (!shouldAttach({ options })) {
      return { headers }
    }

    const token = String(getToken?.() ?? '').trim()
    if (!token) {
      return { headers }
    }

    return {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    }
  }
}

export function applyRequestInterceptors(interceptors, context) {
  return interceptors.reduce((currentContext, interceptor) => {
    const nextContext = interceptor(currentContext)

    return {
      ...currentContext,
      ...nextContext,
      headers: {
        ...currentContext.headers,
        ...(nextContext?.headers ?? {}),
      },
    }
  }, context)
}
