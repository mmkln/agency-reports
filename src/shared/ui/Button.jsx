import { Button as ShadcnButton } from '@/components/ui/button'

import { useInspectorId } from './inspectorId'

export function Button({
  asChild = false,
  children,
  icon,
  id,
  size = 'md',
  variant = 'primary',
  ...props
}) {
  const inspectorId = useInspectorId('Button', id)
  const shadcnSize = {
    md: 'default',
  }[size] ?? size
  const shadcnVariant = {
    ghost: 'ghost',
    primary: 'default',
  }[variant] ?? variant

  if (asChild) {
    return (
      <ShadcnButton asChild id={inspectorId} size={shadcnSize} variant={shadcnVariant} {...props}>
        {children}
      </ShadcnButton>
    )
  }

  return (
    <ShadcnButton id={inspectorId} size={shadcnSize} variant={shadcnVariant} {...props}>
      {icon ? <span className="inline-flex text-[0.95em]" aria-hidden="true">{icon}</span> : null}
      {children}
    </ShadcnButton>
  )
}
