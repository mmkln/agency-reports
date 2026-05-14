import { PageHeader } from './PageHeader'

export function FoundationPageHeader({
  actions,
  className,
  eyebrow,
  id,
  title,
  ...props
}) {
  return (
    <PageHeader
      actions={actions}
      className={className}
      eyebrow={eyebrow}
      id={id}
      title={title}
      variant="inline"
      {...props}
    />
  )
}
