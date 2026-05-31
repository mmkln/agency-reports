import { Button, EmptyState } from '@/shared/ui'
import { Link } from 'react-router-dom'

import { Icon } from '../../../shared/icons'

export function EmptyClientsState() {
  return (
    <EmptyState
      action={(
        <Button asChild>
          <Link to="/admin/clients?createClient=true">
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
