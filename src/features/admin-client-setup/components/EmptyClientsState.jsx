import { Button, EmptyState } from '@/shared/ui'
import { Link } from 'react-router-dom'

import { Icon } from '../../../shared/icons'

export function EmptyClientsState() {
  return (
    <EmptyState
      action={(
        <Button asChild>
          <Link to="/admin/clients?newClient=true">
            <Icon name="plus" size={16} />
            Create first account
          </Link>
        </Button>
      )}
      description="Get started by creating your first account workspace."
      iconName="users"
      title="No accounts yet"
    />
  )
}
