import { Icon } from '@/shared/icons'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'

export function SourceOptionsMenu({
  disabled,
  onRefreshPipelines,
  onRefreshTags,
  onRefreshTouchTrackOptions,
  pipelineSyncState,
  tagSyncState,
  touchTrackOptionSyncState,
}) {
  const isRefreshing = pipelineSyncState === 'syncing'
    || tagSyncState === 'syncing'
    || touchTrackOptionSyncState === 'syncing'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={disabled || isRefreshing}
          icon={(
            <Icon
              className={isRefreshing ? 'animate-spin' : ''}
              name="refreshCw"
              size={15}
            />
          )}
          size="sm"
          type="button"
          variant="ghost"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh GHL options'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onRefreshPipelines}>Refresh pipelines</DropdownMenuItem>
        <DropdownMenuItem onClick={onRefreshTags}>Refresh contact tags</DropdownMenuItem>
        <DropdownMenuItem onClick={onRefreshTouchTrackOptions}>
          Refresh activity options
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
