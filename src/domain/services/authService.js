function removedLocalAuth() {
  throw new Error('Local demo authentication was removed. Use the backend auth API.')
}

export function authenticateWithEmail() {
  return removedLocalAuth()
}

export function buildViewerFromProfile() {
  return removedLocalAuth()
}

export function clearAuthSession() {
  return removedLocalAuth()
}

export function getCurrentViewer() {
  return null
}

export function listLoginProfiles() {
  return []
}

export function setAuthSession() {
  return removedLocalAuth()
}
