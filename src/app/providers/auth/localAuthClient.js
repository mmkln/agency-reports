import {
  authenticateWithEmail,
  clearAuthSession,
  getCurrentViewer,
  listLoginProfiles,
  setAuthSession,
} from '../../../domain/services/authService'

export function createLocalAuthClient({
  dataClient,
  repositories,
}) {
  return {
    getCurrentViewer() {
      return getCurrentViewer({ repositories })
    },
    listLoginProfiles() {
      return dataClient.read((readRepositories) => listLoginProfiles({
        repositories: readRepositories,
      }))
    },
    signInWithEmail({ email, password }) {
      return dataClient.read((readRepositories) => authenticateWithEmail({
        email,
        password,
        repositories: readRepositories,
      }))
    },
    signOut() {
      clearAuthSession()
      return Promise.resolve()
    },
    startDemoSession(userId) {
      setAuthSession(userId)
      return Promise.resolve()
    },
  }
}
