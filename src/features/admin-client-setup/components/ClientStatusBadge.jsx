import { StatusBadge as SharedStatusBadge } from '@/shared/ui'

import { CLIENT_STATUS_META } from '../../../entities/client'

export function ClientStatusBadge({ status }) {
  const meta = CLIENT_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }

  return <SharedStatusBadge meta={meta} />
}
