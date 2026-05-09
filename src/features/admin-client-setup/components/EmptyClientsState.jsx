import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { Icon } from '../../../shared/icons'

export function EmptyClientsState() {
  return (
    <Card className="min-h-[310px] border-slate-200 bg-white shadow-xs">
      <CardContent className="flex min-h-[310px] items-center justify-center">
        <div className="mx-auto max-w-sm text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="users" size={36} />
          </div>
          <h2 className="mt-5 text-base font-semibold text-slate-900">No clients yet</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Get started by creating your first client portal workspace.
          </p>
          <Button asChild className="mt-5" size="lg">
            <a href="#admin-clients?newClient=true">
              <Icon name="plus" size={16} />
              Create first client
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
