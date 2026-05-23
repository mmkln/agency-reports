import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

const sizeClassName = {
  sm: 'min-h-control-small px-control text-label',
  md: 'min-h-target px-component text-ui',
}

export function ViewModeToggle({
  ariaLabel = 'View mode',
  className = '',
  id,
  items,
  onChange,
  size = 'sm',
  value,
}) {
  const inspectorId = useInspectorId('ViewModeToggle', id)

  return (
    <div
      aria-label={ariaLabel}
      className={cn('inline-flex max-w-full items-center gap-micro rounded-full bg-control p-micro', className)}
      id={inspectorId}
      role="radiogroup"
    >
      {items.map((item) => {
        const selected = item.value === value

        return (
          <button
            aria-checked={selected}
            className={cn(
              'inline-flex min-w-0 items-center justify-center gap-item rounded-full text-text-secondary transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 data-[state=on]:bg-control-selected data-[state=on]:text-text-primary',
              sizeClassName[size],
            )}
            data-state={selected ? 'on' : 'off'}
            key={item.value}
            onClick={() => onChange(item.value)}
            role="radio"
            type="button"
          >
            {item.icon ? <span aria-hidden="true" className="inline-flex shrink-0">{item.icon}</span> : null}
            <span className="truncate">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
