import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

import { Icon } from '../icons'
import { useInspectorId } from './inspectorId'

export function SectionNav({
  ariaLabel,
  className = '',
  id,
  items,
  selectedId,
}) {
  const inspectorId = useInspectorId('SectionNav', id)

  return (
    <nav aria-label={ariaLabel} className={cn('min-w-0', className)} id={inspectorId}>
      <div className="flex max-w-full gap-micro overflow-x-auto pb-micro lg:grid lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const isSelected = selectedId === item.id

          return (
            <Link
              aria-current={isSelected ? 'page' : undefined}
              className={cn(
                'inline-flex h-target min-w-max items-center gap-item rounded-control px-control text-ui no-underline transition-colors duration-motion-fast ease-motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 lg:w-full',
                isSelected
                  ? 'bg-fill text-text-primary'
                  : 'text-text-secondary hover:bg-fill-secondary hover:text-text-primary',
              )}
              key={item.id}
              to={item.to}
            >
              {item.iconName ? (
                <Icon
                  aria-hidden="true"
                  className="text-current"
                  name={item.iconName}
                  size={16}
                />
              ) : null}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
