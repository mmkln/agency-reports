import { USER_ROLES } from '@/entities/profile'
import { TASK_STATUSES } from '@/entities/task'
import { VISIBILITY } from '@/entities/update'

export function createBlankTaskDraft({ clients, routeClientId, viewer }) {
  const clientId = clients.some((client) => client.id === routeClientId)
    ? routeClientId
    : clients[0]?.id ?? ''

  return {
    assigneeName: viewer.role === USER_ROLES.AGENCY_TEAM ? viewer.name : '',
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
