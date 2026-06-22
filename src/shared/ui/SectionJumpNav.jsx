import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function SectionJumpNav({
  ariaLabel = 'Sections',
  className = '',
  id,
  items,
  selectedId,
}) {
  const inspectorId = useInspectorId('SectionJumpNav', id)

  return (
    <nav aria-label={ariaLabel} className={cn('min-w-0', className)} id={inspectorId}>
      <div className="flex max-w-full gap-micro overflow-x-auto pb-micro">
        {items.map((item) => {
          const selected = selectedId === item.id

          return (
            <a
              aria-current={selected ? 'location' : undefined}
              className={cn(
                'inline-flex min-h-control-small min-w-max items-center rounded-full px-control text-label no-underline transition-colors duration-motion-fast ease-motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35',
                selected
                  ? 'bg-control-selected text-text-primary'
                  : 'text-text-secondary hover:bg-control-hover hover:text-text-primary',
              )}
              href={item.href}
              key={item.id}
            >
              {item.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
