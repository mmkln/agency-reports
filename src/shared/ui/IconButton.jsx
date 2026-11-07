import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

const buttonSize = {
  md: 'icon',
  sm: 'icon-sm',
  xs: 'icon-xs',
}

const variantClassName = {
  ghost: 'border-transparent text-text-secondary hover:bg-control-hover hover:text-text-primary',
  outline: 'border-control-border bg-control text-text-secondary hover:bg-control-hover hover:text-text-primary',
}

export function IconButton({
  className,
  id,
  size = 'md',
  type = 'button',
  variant = 'ghost',
  ...props
}) {
  const inspectorId = useInspectorId('IconButton', id)

  return (
    <Button
      id={inspectorId}
      className={cn(
        'rounded-full focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted',
        variantClassName[variant],
        className,
      )}
      size={buttonSize[size] ?? buttonSize.md}
      type={type}
      variant={variant}
      {...props}
    />
  )
}
