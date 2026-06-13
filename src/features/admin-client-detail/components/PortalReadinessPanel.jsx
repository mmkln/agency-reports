import { Link } from 'react-router-dom'

import { Icon } from '@/shared/icons'
import { Button, Panel, PanelBody, PanelHeader, StatusBadge } from '@/shared/ui'

import { buildPortalReadinessItems, getPreviewPortalHref } from '../model/clientDetailPresentation'

export function PortalReadinessPanel({ client, memberships }) {
  const previewHref = getPreviewPortalHref(client)
  const readinessItems = buildPortalReadinessItems({ client, memberships })

  return (
    <Panel>
      <PanelHeader
        action={previewHref ? (
          <Button asChild size="sm" variant="outline">
            <Link to={previewHref}>
              <Icon name="arrowUpRight" size={16} />
              Preview portal
            </Link>
          </Button>
        ) : null}
        divided
        iconName="checkCircle2"
        title="Portal readiness"
      />
      <PanelBody>
        <div className="grid gap-component sm:grid-cols-2 lg:grid-cols-3">
          {readinessItems.map((item) => (
            <div className="flex min-w-0 items-center justify-between gap-control" key={item.label}>
              <span className="truncate text-ui text-text-secondary">{item.label}</span>
              <StatusBadge meta={item.meta} />
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}
