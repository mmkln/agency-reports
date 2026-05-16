const githubPagesBasePath = '/agency-reports'

export function getAppBasename() {
  if (import.meta.env.BASE_URL !== '/') {
    return import.meta.env.BASE_URL.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const { pathname } = window.location

    if (pathname === githubPagesBasePath || pathname.startsWith(`${githubPagesBasePath}/`)) {
      return githubPagesBasePath
    }
  }

  return ''
}

export function getAppBaseHref() {
  const basename = getAppBasename()

  return basename ? `${basename}/` : '/'
}
