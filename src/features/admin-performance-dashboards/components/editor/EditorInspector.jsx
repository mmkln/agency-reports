import { Link } from 'react-router-dom'

import {
  Button,
  StatusBadge,
} from '@/shared/ui'

import {
  PERFORMANCE_DASHBOARD_STATUS_META,
  PERFORMANCE_DATA_CONFIDENCE_META,
  PERFORMANCE_DATA_MODE_META,
} from '../../../../entities/performance-dashboard'
import { WorkspaceCard } from '../../../admin-client-workspace/components/WorkspaceCard'
import { EditorSectionHeader } from './AdminPerformanceDashboardEditorPrimitives'

export function EditorInspector({
  form,
  selectedClient,
}) {
  return (
    <aside className="grid h-fit gap-6 lg:sticky lg:top-24">
      <WorkspaceCard iconName="checkCircle2" title="Publish Readiness">
        <div className="grid gap-3 text-ui">
          <StatusBadge meta={PERFORMANCE_DASHBOARD_STATUS_META[form.status]} />
          <StatusBadge meta={PERFORMANCE_DATA_CONFIDENCE_META[form.dataConfidence]} />
          <StatusBadge meta={PERFORMANCE_DATA_MODE_META[form.dataMode]} />
          <div className="rounded-control bg-surface-subtle p-3 text-label font-normal text-text-muted">
            Publish requires metadata, data freshness, executive narrative, hero metric, KPI cards, at least one insight, and at least one next action.
          </div>
        </div>
      </WorkspaceCard>

      <WorkspaceCard iconName="users" title="Account Context">
        <div className="grid gap-3 text-ui">
          <div>
            <p className="text-label text-text-muted">Account</p>
            <p className="mt-1 font-semibold text-text-primary">{selectedClient?.name ?? 'Unknown account'}</p>
          </div>
          <div>
            <p className="text-label text-text-muted">Portal slug</p>
            <p className="mt-1 text-text-secondary">/{selectedClient?.portalSlug ?? selectedClient?.portal_slug ?? 'unknown'}</p>
          </div>
          <Button asChild size="sm" type="button" variant="outline">
            <Link to={`/admin/client-overview?clientId=${form.clientId}`}>
              Open Overview Editor
            </Link>
          </Button>
        </div>
      </WorkspaceCard>

      <WorkspaceCard iconName="fileText" title="Detail Coverage">
        <div className="grid gap-3">
          <EditorSectionHeader
            description="These sections are optional detail. Keep them focused so the executive view remains readable."
            title="Additional dashboard depth"
          />
          <ul className="grid gap-2 text-label font-normal text-text-muted">
            <li>{form.content.trends.length} trend series</li>
            <li>{form.content.service_sections.length} service sections</li>
            <li>{form.content.appendix_tables.length} appendix tables</li>
          </ul>
        </div>
      </WorkspaceCard>
    </aside>
  )
}
