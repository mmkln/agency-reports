import { useId } from 'react'

import { cn } from '@/lib/utils'

const sizeClassName = {
  md: 'h-target px-component text-ui',
  sm: 'h-control-small px-control text-label',
  xs: 'h-control-mini px-control text-label',
}

export function ToggleGroup({
  className = '',
  items,
  name,
  onChange,
  size = 'sm',
  value,
}) {
  const generatedId = useId()
  const groupName = name ?? `toggle-${generatedId}`

  return (
    <div
      aria-label={groupName}
      className={cn('inline-flex items-center gap-0 rounded-full bg-control p-micro', className)}
      role="radiogroup"
    >
      {items.map((item) => {
        const selected = item.value === value

        return (
          <button
            aria-checked={selected}
            aria-label={item.label}
            className={cn(
              'flex items-center gap-item rounded-full text-text-secondary transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover hover:text-text-primary data-[state=on]:bg-control-selected data-[state=on]:text-text-primary',
              sizeClassName[size],
            )}
            data-state={selected ? 'on' : 'off'}
            key={item.value}
            onClick={() => onChange(item.value)}
            role="radio"
            title={item.label}
            type="button"
          >
            <input name={groupName} type="hidden" value={selected ? item.value : ''} />
            {item.icon}
            <span className="sr-only">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
