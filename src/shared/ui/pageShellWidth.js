const pageShellWidthClasses = {
  content: 'mx-auto max-w-content',
  form: 'mx-auto max-w-form',
  full: '',
  readable: 'mx-auto max-w-readable',
  wide: 'mx-auto max-w-viewport-safe',
}

export function getPageShellWidthClass(width = 'full') {
  return pageShellWidthClasses[width] ?? pageShellWidthClasses.full
}
