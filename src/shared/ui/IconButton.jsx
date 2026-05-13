import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const sizeClassName = {
  md: 'h-target w-target',
  sm: 'h-control-small w-control-small',
}

const variantClassName = {
  ghost: 'border-transparent text-text-secondary hover:bg-control-hover hover:text-text-primary',
  outline: 'border-control-border bg-control text-text-secondary hover:bg-control-hover hover:text-text-primary',
}

export function IconButton({
  className,
  size = 'md',
  type = 'button',
  variant = 'ghost',
  ...props
}) {
  return (
    <Button
      className={cn(
        'rounded-full focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted',
        variantClassName[variant],
        sizeClassName[size],
        className,
      )}
      size="icon"
      type={type}
      variant={variant}
      {...props}
    />
  )
}
