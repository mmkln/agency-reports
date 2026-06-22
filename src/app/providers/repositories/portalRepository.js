function removedPortalRepository() {
  throw new Error('Local portal repository runtime was removed. Use backend API clients instead.')
}

export const portalRepository = Object.freeze({
  reset: removedPortalRepository,
})
