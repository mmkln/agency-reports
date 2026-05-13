import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Dropdown({
  align = 'right',
  buttonClassName = '',
  children,
  className = '',
  label,
  menuClassName = '',
}) {
  return (
    <div className={cn('inline-flex', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn(
              'h-target rounded-full border border-control-border bg-control px-component text-ui text-text-secondary hover:bg-control-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring',
              buttonClassName,
            )}
            type="button"
            variant="ghost"
          >
            {label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align === 'left' ? 'start' : 'end'}
          className={cn(
            'min-w-menu rounded-control border border-island-border bg-material-liquid p-item text-text-primary shadow-premium backdrop-blur-2xl',
            menuClassName,
          )}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
