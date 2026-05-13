import { Button as ShadcnButton } from '@/components/ui/button'

export function Button({
  asChild = false,
  children,
  icon,
  size = 'md',
  variant = 'primary',
  ...props
}) {
  const shadcnSize = {
    md: 'default',
  }[size] ?? size
  const shadcnVariant = {
    ghost: 'ghost',
    primary: 'default',
  }[variant] ?? variant

  if (asChild) {
    return (
      <ShadcnButton asChild size={shadcnSize} variant={shadcnVariant} {...props}>
        {children}
      </ShadcnButton>
    )
  }

  return (
    <ShadcnButton size={shadcnSize} variant={shadcnVariant} {...props}>
      {icon ? <span className="inline-flex text-[0.95em]" aria-hidden="true">{icon}</span> : null}
      {children}
    </ShadcnButton>
  )
}
