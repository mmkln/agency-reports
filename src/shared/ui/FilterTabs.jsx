import { cn } from '@/lib/utils'

import { Button } from './Button'
import { useInspectorId } from './inspectorId'

export function FilterTabs({
  ariaLabel = 'Filters',
  className,
  id,
  items = [],
  onValueChange,
  value,
}) {
  const inspectorId = useInspectorId('FilterTabs', id)

  return (
    <div id={inspectorId} className={cn('-mx-1 overflow-x-auto px-1', className)}>
      <div
        aria-label={ariaLabel}
        className="inline-flex min-w-max items-center gap-micro rounded-control bg-control p-micro"
        role="group"
      >
        {items.map((item) => {
          const selected = value === item.value

          return (
            <Button
              aria-pressed={selected}
              className={cn(
                'h-control-small rounded-control px-control',
                selected && 'bg-block text-text-primary shadow-block hover:bg-block',
              )}
              disabled={item.disabled}
              key={item.value}
              onClick={() => onValueChange?.(item.value)}
              size="sm"
              type="button"
              variant={selected ? 'secondary' : 'ghost'}
            >
              {item.label}
              {item.count !== undefined ? (
                <span className="ml-1 text-label font-normal opacity-75">{item.count}</span>
              ) : null}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
