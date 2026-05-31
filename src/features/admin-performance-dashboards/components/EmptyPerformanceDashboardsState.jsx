import { Link } from 'react-router-dom'

import { Button, EmptyState } from '@/shared/ui'

import { Icon } from '../../../shared/icons'

export function EmptyPerformanceDashboardsState({
  createHref = '/admin/performance-dashboards?createPerformanceDashboard=true',
  hasClients,
}) {
  if (!hasClients) {
    return (
      <EmptyState
        action={(
          <Button asChild>
            <Link to="/admin/clients?createClient=true">
              <Icon name="plus" size={15} />
              Create first account
            </Link>
          </Button>
        )}
        description="Create an account workspace before adding portal analytics dashboards."
        iconName="users"
        title="No account workspaces yet"
      />
    )
  }

  return (
    <EmptyState
      action={(
        <Button asChild>
          <Link to={createHref}>
            <Icon name="plus" size={15} />
            Create performance dashboard
          </Link>
        </Button>
      )}
      description="Create a draft dashboard period, fill it in with the structured editor or import prepared JSON, validate it, then publish it to the portal."
      iconName="layoutDashboard"
      title="No performance dashboards yet"
    />
  )
}
