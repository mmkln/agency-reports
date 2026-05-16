import { PageShell } from '@/shared/ui'

import {
  createBlankProject,
  moveListItem,
} from '../model'
import { ClientLinksAssetsPanel } from './ClientLinksAssetsPanel'
import { ConnectedWorkflowSummary } from './ConnectedWorkflowSummary'
import { CurrentFocusEditor } from './CurrentFocusEditor'
import { LatestUpdateEditor } from './LatestUpdateEditor'
import { ProgressSummaryPanel } from './ProgressSummaryPanel'

export function OverviewEditorSections({
  draft,
  editor,
  onRequestDeletion,
  onUpdateDraft,
}) {
  return (
    <PageShell className="px-app-gutter py-content-gutter">
      <div className="grid gap-card">
        <div className="grid gap-card lg:grid-cols-2">
          <LatestUpdateEditor
            draft={draft}
            onDeleteUpdate={() => onRequestDeletion('latest_update', null, 'Latest update')}
            onUpdateUpdates={(updates) => onUpdateDraft((currentDraft) => ({ ...currentDraft, updates }))}
          />
          <CurrentFocusEditor
            draft={draft}
            onChange={(currentFocus) => onUpdateDraft((currentDraft) => ({
              ...currentDraft,
              currentFocus,
            }))}
          />
        </div>
        <div className="grid gap-card lg:grid-cols-2">
          <ProgressSummaryPanel
            draft={draft}
            onAddProject={() => onUpdateDraft((currentDraft) => ({
              ...currentDraft,
              projects: [
                ...currentDraft.projects,
                {
                  ...createBlankProject(),
                  sort_order: (currentDraft.projects.length + 1) * 10,
                },
              ],
            }))}
            onMoveProject={(index, direction) => onUpdateDraft((currentDraft) => ({
              ...currentDraft,
              projects: moveListItem(currentDraft.projects, index, direction),
            }))}
            onRemoveProject={(index) => onRequestDeletion(
              'project',
              index,
              draft.projects[index]?.name || `Project ${index + 1}`,
            )}
            onUpdateProjects={(projects) => onUpdateDraft((currentDraft) => ({ ...currentDraft, projects }))}
          />
          <ClientLinksAssetsPanel
            draft={draft}
            onUpdateDashboardLinks={(dashboardLinks) => onUpdateDraft((currentDraft) => ({
              ...currentDraft,
              dashboardLinks,
            }))}
            onUpdateReports={(reports) => onUpdateDraft((currentDraft) => ({ ...currentDraft, reports }))}
          />
        </div>
        <ConnectedWorkflowSummary editor={editor} />
      </div>
    </PageShell>
  )
}
