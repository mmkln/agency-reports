import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  ContentToolbar,
  ErrorBlock,
  PageShell,
} from '@/shared/ui'

import { USER_ROLES } from '../../../entities/profile'
import {
  CreateTaskDialog,
  useCreateTaskWorkflow,
} from '../../../features/tasks/create-task'
import {
  useUpdateTaskWorkflow,
} from '../../../features/tasks/update-task'
import {
  TaskMarkdownImportModal,
  useTaskMarkdownImportWorkflow,
} from '../../../features/tasks/import-task-markdown'
import { TaskMarkdownExportModal } from '../../../features/tasks/export-task-markdown'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'
import {
  EmptyTasksState,
  TeamTaskDetailPanel,
  TeamTaskFilters,
  TeamTaskInbox,
} from '../../../widgets/team-tasks'
import { getTeamTaskFilterPath, loadTeamTasks, normalizeTeamTaskFilters } from './teamTaskFilterState'

function getTaskWorkspacePath(viewer) {
  return viewer?.role === USER_ROLES.AGENCY_ADMIN ? '/admin/tasks' : '/team/tasks'
}

function createEmptyTaskData(filters, viewer) {
  return {
    canCreateClientWorkItems: viewer?.role === USER_ROLES.AGENCY_ADMIN,
    canUseMineFilter: viewer?.role === USER_ROLES.AGENCY_TEAM,
    clients: [],
    filters,
    projects: [],
    status: 'loading',
    tasks: [],
  }
}

export function TeamTasksPage({ routeParams = {}, runtime }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [reloadTick, setReloadTick] = useState(0)
  const filters = useMemo(() => normalizeTeamTaskFilters(routeParams), [routeParams])
  const basePath = getTaskWorkspacePath(runtime.viewer)
  const isCreateTaskOpen = routeParams.create === '1'
  const isExportTaskOpen = routeParams.export === '1'
  const isImportTaskOpen = routeParams.import === '1'
  const taskResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:tasks:${JSON.stringify(filters)}:${reloadTick}`,
    initialData: createEmptyTaskData(filters, runtime.viewer),
    load: () => runtime.dataClient.read((repositories) => loadTeamTasks(filters, {
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const taskData = taskResource.data ?? createEmptyTaskData(filters, runtime.viewer)
  const createTaskWorkflow = useCreateTaskWorkflow({
    clients: taskData.clients,
    onClose: () => navigate(getTeamTaskFilterPath(filters, basePath), { replace: true }),
    onCreated: refreshTaskData,
    routeClientId: filters.clientId,
    runtime,
    toast,
  })
  const updateTaskWorkflow = useUpdateTaskWorkflow({
    onUpdated: refreshTaskData,
    runtime,
    tasks: taskData.tasks,
    toast,
  })
  const importTaskWorkflow = useTaskMarkdownImportWorkflow({
    onClose: () => navigate(getTeamTaskFilterPath(filters, basePath), { replace: true }),
    onImported: refreshTaskData,
    runtime,
    toast,
  })
  const selectedTask = updateTaskWorkflow.selectedTask

  function closeTaskExport() {
    navigate(getTeamTaskFilterPath(filters, basePath), { replace: true })
  }

  function refreshTaskData() {
    setReloadTick((currentTick) => currentTick + 1)
  }

  const hasFilters = Object.entries(filters).some(([key, value]) => (
    key === 'search' ? Boolean(value) : key !== 'scope' && value !== 'all'
  ))

  return (
    <PageShell>
      <div className={`grid items-start gap-card ${selectedTask ? 'xl:grid-cols-inspector' : ''}`}>
        <div className="grid min-w-0 gap-card">
          <ContentToolbar className="rounded-none bg-transparent p-0">
            <TeamTaskFilters
              filters={filters}
              onChange={(nextFilters) => navigate(getTeamTaskFilterPath(nextFilters, basePath))}
              taskData={taskData}
            />
          </ContentToolbar>
          {taskResource.status === 'error' ? (
            <ErrorBlock title="Tasks could not be loaded">
              {taskResource.error}
            </ErrorBlock>
          ) : taskData.tasks.length > 0 ? (
            <TeamTaskInbox
              onOpenTask={updateTaskWorkflow.selectTask}
              selectedTaskId={selectedTask?.id}
              tasks={taskData.tasks}
            />
          ) : (
            <EmptyTasksState hasFilters={hasFilters} />
          )}
        </div>
        {selectedTask ? (
          <TeamTaskDetailPanel
            blockerReasonError={updateTaskWorkflow.blockerReasonError}
            canSendToClientReview={updateTaskWorkflow.canSendToClientReview}
            draft={updateTaskWorkflow.draft}
            error={updateTaskWorkflow.error}
            isDirty={updateTaskWorkflow.isDirty}
            onChange={updateTaskWorkflow.changeDraft}
            onClose={updateTaskWorkflow.close}
            onReset={updateTaskWorkflow.reset}
            onSave={updateTaskWorkflow.save}
            onSendToClientReview={updateTaskWorkflow.sendToClientReview}
            saveState={updateTaskWorkflow.saveState}
            statusOptions={updateTaskWorkflow.statusOptions}
            task={selectedTask}
          />
        ) : null}
      </div>
      <CreateTaskDialog
        error={createTaskWorkflow.error}
        isOpen={isCreateTaskOpen}
        onChange={createTaskWorkflow.changeDraft}
        onClose={createTaskWorkflow.close}
        onSubmit={createTaskWorkflow.submit}
        saveState={createTaskWorkflow.saveState}
        taskData={taskData}
        taskDraft={createTaskWorkflow.draft}
        viewer={runtime.viewer}
      />
      <TaskMarkdownImportModal
        clients={taskData.clients}
        defaultClientId={filters.clientId === 'all' ? taskData.clients[0]?.id : filters.clientId}
        importError={importTaskWorkflow.error}
        importPlan={importTaskWorkflow.plan}
        isOpen={isImportTaskOpen}
        onApply={importTaskWorkflow.apply}
        onClose={importTaskWorkflow.close}
        onInvalidatePreview={importTaskWorkflow.clearPreview}
        onPreview={importTaskWorkflow.preview}
        projects={taskData.projects}
        saveState={importTaskWorkflow.saveState}
      />
      <TaskMarkdownExportModal
        isOpen={isExportTaskOpen}
        onClose={closeTaskExport}
        tasks={taskData.tasks}
        title={filters.clientId === 'all' ? 'Tasks' : `${taskData.clients.find((client) => client.id === filters.clientId)?.name ?? 'Client'} Tasks`}
      />
    </PageShell>
  )
}
