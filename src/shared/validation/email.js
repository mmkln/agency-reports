export const EMAIL_VALIDATION_ERROR = 'Email must be a valid email address.'

const DOMAIN_LABEL_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/
const TOP_LEVEL_DOMAIN_PATTERN = /^[A-Za-z]{2,63}$/

export function isValidEmail(value) {
  const email = String(value ?? '').trim()
  const parts = email.split('@')

  if (parts.length !== 2) {
    return false
  }

  const [localPart, domain] = parts
  if (
    !localPart
    || !domain
    || /\s/.test(email)
    || localPart.startsWith('.')
    || localPart.endsWith('.')
    || domain.startsWith('.')
    || domain.endsWith('.')
  ) {
    return false
  }

  const domainLabels = domain.split('.')
  if (domainLabels.length < 2 || domainLabels.some((label) => !DOMAIN_LABEL_PATTERN.test(label))) {
    return false
  }

  return TOP_LEVEL_DOMAIN_PATTERN.test(domainLabels.at(-1))
}

export function getEmailValidationIssue(value, message = EMAIL_VALIDATION_ERROR) {
  return isValidEmail(value) ? '' : message
}
