const REMOVED_LOCAL_PASSWORD_MESSAGE = 'Local demo password credentials were removed. Use Django account credentials.'

export function validatePasswordPair() {
  throw new Error(REMOVED_LOCAL_PASSWORD_MESSAGE)
}

export function findPasswordCredential() {
  return null
}

export function createPasswordCredential() {
  throw new Error(REMOVED_LOCAL_PASSWORD_MESSAGE)
}

export function verifyPasswordCredential() {
  return false
}
