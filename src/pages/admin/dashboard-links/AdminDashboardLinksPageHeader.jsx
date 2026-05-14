import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui'

import { Icon } from '../../../shared/icons'
import { PageHeader } from '../../../shared/layout/PageHeader'

export function AdminDashboardLinksPageHeader() {
  return (
    <PageHeader
      actions={(
        <Button asChild>
          <Link to="/admin/dashboard-links?newDashboard=true">
            <Icon name="plus" size={16} />
            New Dashboard
          </Link>
        </Button>
      )}
      subtitle="Manage external dashboard embeds and links across client portal workspaces."
      title="Dashboard Links"
    />
  )
}
