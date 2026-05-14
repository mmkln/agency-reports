import { Link } from 'react-router-dom'

import {
  Button,
  EmptyState,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'

export function EmptyDashboardLinksState({ hasClients = true }) {
  const actionHref = hasClients ? '/admin/dashboard-links?newDashboard=true' : '/admin/clients?newClient=true'
  const actionLabel = hasClients ? 'Add first dashboard' : 'Create first client'

  return (
    <EmptyState
      action={(
        <Button asChild>
          <Link to={actionHref}>
            <Icon name="plus" size={16} />
            {actionLabel}
          </Link>
        </Button>
      )}
      description={hasClients
        ? 'Add an external dashboard link for a client. The portal will embed or open that provider dashboard without becoming an analytics platform.'
        : 'Create a client workspace first. Dashboard links are always scoped to one client portal.'}
      iconName="layoutDashboard"
      title={hasClients ? 'No dashboard links yet' : 'No clients available'}
    />
  )
}
