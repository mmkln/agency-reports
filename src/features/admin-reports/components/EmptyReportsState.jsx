import { Link } from 'react-router-dom'

import { Button, EmptyState, PrimitiveCard as Card } from '@/shared/ui'

import { Icon } from '../../../shared/icons'

export function EmptyReportsState({ hasClients = true }) {
  return (
    <Card className="border-control-border bg-block shadow-none">
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
            <Link to="/admin/clients?newClient=true">
              <Icon name="plus" size={16} />
              Create client first
            </Link>
          </Button>
        )}
        description={
          hasClients
            ? 'Create a structured monthly summary when the agency is ready to explain performance and next actions.'
            : 'A client workspace is required before reports can be created.'
        }
        iconName="fileText"
        title={hasClients ? 'No monthly reports yet' : 'No clients available'}
      />
    </Card>
  )
}

export function EmptyFilteredReportsState({ onReset }) {
  return (
    <Card className="border-control-border bg-block shadow-none">
      <EmptyState
        action={(
          <Button onClick={onReset} type="button" variant="outline">
            Clear filters
          </Button>
        )}
        description="Try a different search term, client, status, or reporting period."
        iconName="search"
        title="No reports match these filters"
      />
    </Card>
  )
}
