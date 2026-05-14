import { cn } from '@/lib/utils'

import { IconButton } from './IconButton'
import { useInspectorId } from './inspectorId'
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip'

export function TooltipIconButton({
  children,
  className,
  id,
  label,
  tooltipContent,
  type = 'button',
  ...props
}) {
  const inspectorId = useInspectorId('TooltipIconButton', id)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton
          aria-label={label}
          className={cn(className)}
          id={inspectorId}
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
