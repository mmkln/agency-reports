import { Icon } from '@/shared/icons'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'

export function ReviewActionsMenu({ onArchive, review }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Review actions"
          icon={<Icon name="ellipsis" size={16} />}
          size="icon-sm"
          type="button"
          variant="ghost"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          disabled={review.status === 'archived'}
          onClick={() => onArchive(review)}
        >
          Archive review
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
