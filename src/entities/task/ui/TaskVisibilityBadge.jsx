import { Icon } from '@/shared/icons'

const CLIENT_VISIBLE = 'client_visible'

export function TaskVisibilityBadge({ visibility }) {
  const isClientVisible = visibility === CLIENT_VISIBLE

  return (
    <span className="inline-flex items-center gap-1.5 text-label font-normal text-text-muted">
      <Icon name={isClientVisible ? 'user' : 'lock'} size={13} />
      {isClientVisible ? 'Client visible' : 'Internal'}
    </span>
  )
}
