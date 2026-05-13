import { cn } from '@/lib/utils'

import { IconButton } from './IconButton'
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip'

export function TooltipIconButton({
  children,
  className,
  label,
  tooltipContent,
  type = 'button',
  ...props
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton
          aria-label={label}
          className={cn(className)}
          type={type}
          {...props}
        >
          {children}
        </IconButton>
      </TooltipTrigger>
      <TooltipContent>{tooltipContent ?? label}</TooltipContent>
    </Tooltip>
  )
}
