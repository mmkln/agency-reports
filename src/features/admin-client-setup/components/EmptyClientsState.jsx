import { Button, EmptyState } from '@/shared/ui'
import { Link } from 'react-router-dom'

import { ROUTE_PATHS, withSearchParams } from '../../../domain/navigation/routePaths'
import { Icon } from '../../../shared/icons'

export function EmptyClientsState() {
  return (
    <EmptyState
      action={(
        <Button asChild>
          <Link to={withSearchParams(ROUTE_PATHS.agencyClients, { createClient: true })}>
            <Icon name="plus" size={16} />
            Create first client
          </Link>
        </Button>
      )}
      description="Get started by creating your first client workspace."
      iconName="users"
      title="No clients yet"
    />
  )
}
