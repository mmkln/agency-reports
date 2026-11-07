import { cn } from '@/lib/utils'
import { Icon } from '@/shared/icons'
import { TooltipIconButton } from '@/shared/ui'

export function PipelineRefreshButton({ disabled, isRefreshing, onRefresh }) {
  const label = isRefreshing
    ? 'Refreshing pipelines from GHL'
    : 'Refresh pipelines from GHL'

  return (
    <TooltipIconButton
      disabled={disabled || isRefreshing}
      label={label}
      onClick={onRefresh}
      size="sm"
    >
      <Icon
        className={cn(isRefreshing && 'animate-spin')}
        name="refreshCw"
        size={15}
      />
    </TooltipIconButton>
  )
}
