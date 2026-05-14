import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui'

import { Icon } from '../../../shared/icons'
import { PageHeader } from '../../../shared/layout/PageHeader'

export function AdminReportsPageHeader() {
  return (
    <PageHeader
      actions={(
        <Button asChild>
          <Link to="/admin/reports?newReport=true">
            <Icon name="plus" size={16} />
            New Report
          </Link>
        </Button>
      )}
      subtitle="Create, publish, archive, and manage client-facing monthly summaries."
      title="Reports"
    />
  )
}
