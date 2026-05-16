import { StatusBadge } from '@/shared/ui'

import { getTaskStatusMeta } from '../model'

export function TaskStatusBadge({ status }) {
  return <StatusBadge meta={getTaskStatusMeta(status)} />
}
