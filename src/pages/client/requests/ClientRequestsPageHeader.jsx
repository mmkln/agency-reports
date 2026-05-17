import { PageHeader } from '@/shared/ui'

function getNewRequestPath({
  activeRoute,
  routeParams = {},
  runtime,
}) {
  const params = new URLSearchParams()

  Object.entries(routeParams).forEach(([key, value]) => {
    if (value != null && value !== '') {
      params.set(key, value)
    }
  })

  if (!params.has('clientId') && runtime?.defaultClientId) {
    params.set('clientId', runtime.defaultClientId)
  }

  params.set('newRequest', 'true')

  return `${activeRoute?.path ?? '/client/requests'}?${params.toString()}`
}

export function ClientRequestsPageHeader({ activeRoute, routeParams = {}, runtime }) {
  return (
    <PageHeader
      primaryAction={{
        children: 'New request',
        to: getNewRequestPath({ activeRoute, routeParams, runtime }),
      }}
      title="Requests"
      width={activeRoute?.contentWidth}
    />
  )
}
