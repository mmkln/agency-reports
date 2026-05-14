import { Button, CardContent, PrimitiveCard as Card } from '@/shared/ui'
import { Link } from 'react-router-dom'

import { Icon } from '../../../shared/icons'

export function EmptyClientsState() {
  return (
    <Card className="min-h-[310px] border-control-border bg-block shadow-none">
      <CardContent className="flex min-h-[310px] items-center justify-center">
        <div className="mx-auto max-w-sm text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-control text-text-quaternary">
            <Icon name="users" size={36} />
          </div>
          <h2 className="mt-5 text-base font-semibold text-text-primary">No clients yet</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Get started by creating your first client portal workspace.
          </p>
          <Button asChild className="mt-5" size="lg">
            <Link to="/admin/clients?newClient=true">
              <Icon name="plus" size={16} />
              Create first client
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
