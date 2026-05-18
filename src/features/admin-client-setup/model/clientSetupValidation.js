const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getShortTextIssue(value, fieldName) {
  if (!value) {
    return ''
  }

  return value.trim().length < 2 ? `${fieldName} must be at least 2 characters.` : ''
}

export function getEmailIssue(value) {
  if (!value) {
    return ''
  }

  return EMAIL_PATTERN.test(value.trim()) ? '' : 'Enter a valid email address.'
}
