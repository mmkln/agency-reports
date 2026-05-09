import { Button as ShadcnButton } from '@/components/ui/button'

export function Button({
  children,
  icon,
  size = 'md',
  variant = 'primary',
  ...props
}) {
  const shadcnSize = {
    sm: 'default',
    md: 'lg',
  }[size] ?? size
  const shadcnVariant = {
    ghost: 'outline',
    primary: 'default',
  }[variant] ?? variant

  return (
    <ShadcnButton size={shadcnSize} variant={shadcnVariant} {...props}>
      {icon ? <span className="inline-flex text-[0.95em]" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </ShadcnButton>
  )
}
