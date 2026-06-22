import { TASK_STATUSES } from '@/entities/task'
import { VISIBILITY } from '@/entities/update'
import { isAgencyTeamTaskCreator } from './taskCreateAccess'

export function createBlankTaskDraft({ clients, routeClientId, viewer }) {
  const clientId = clients.some((client) => client.id === routeClientId)
    ? routeClientId
    : clients[0]?.id ?? ''

  return {
    assigneeName: isAgencyTeamTaskCreator(viewer) ? viewer.name : '',
    clientId,
    clientSafeSummary: '',
    description: '',
    dueDate: '',
    internalNote: '',
    projectId: '',
    status: TASK_STATUSES.TODO,
    title: '',
    visibility: VISIBILITY.INTERNAL,
  }
}
