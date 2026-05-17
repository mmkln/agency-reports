export function getClinicPreviewSource(routeParams = {}) {
  return routeParams.preview === 'draft' || routeParams.source === 'draft'
    ? 'draft'
    : 'published'
}
