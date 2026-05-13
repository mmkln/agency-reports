export function ClientAvatar({ client, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
  const initials = client.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('') || 'CL'

  if (client.logo_url) {
    return (
      <img
        alt=""
        className={`${sizeClass} rounded-control border border-control-border bg-surface-subtle object-cover`}
        src={client.logo_url}
      />
    )
  }

  return (
    <span className={`${sizeClass} flex items-center justify-center rounded-control border border-action/20 bg-action-muted text-xs font-bold text-action`}>
      {initials}
    </span>
  )
}
