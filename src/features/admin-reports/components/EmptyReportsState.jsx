import { Link } from 'react-router-dom'

import { Button, EmptyState } from '@/shared/ui'

import { Icon } from '../../../shared/icons'

export function EmptyReportsState({ hasClients = true }) {
  return (
    <EmptyState
      action={hasClients ? (
        <Button asChild>
          <Link to="/admin/reports?newReport=true">
            <Icon name="plus" size={16} />
            Create first report
          </Link>
        </Button>
      ) : (
        <Button asChild>
          <Link to="/admin/clients?createClient=true">
            <Icon name="plus" size={16} />
            Create client first
          </Link>
        </Button>
      )}
      description={
        hasClients
          ? 'Create a structured monthly summary when the team is ready to explain performance and next actions.'
          : 'An account workspace is required before reports can be created.'
      }
      iconName="fileText"
      title={hasClients ? 'No monthly reports yet' : 'No accounts available'}
    />
  )
}

export function EmptyFilteredReportsState({ onReset }) {
  return (
    <EmptyState
      action={(
        <Button onClick={onReset} type="button" variant="outline">
          Reset
        </Button>
      )}
      description="Try a different search term, client, status, or reporting month."
      iconName="search"
      title="No reports match these filters"
    />
  )
}
