import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

const columnsClass = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

function hasDisplayValue(value) {
  return value !== null && value !== undefined && value !== ''
}

export function PropertyItem({
  children,
  className,
  emptyValue = 'Not set',
  id,
  label,
  labelClassName,
  value,
  valueClassName,
  ...props
}) {
  const inspectorId = useInspectorId('PropertyItem', id)
  const resolvedValue = children ?? value
  const hasValue = hasDisplayValue(resolvedValue)

  return (
    <div id={inspectorId} className={cn('min-w-0', className)} {...props}>
      <p className={cn('text-label text-text-muted uppercase', labelClassName)}>{label}</p>
      <div className={cn('mt-1 min-w-0 text-ui text-text-primary', !hasValue && 'text-text-muted', valueClassName)}>
        {hasValue ? resolvedValue : emptyValue}
      </div>
    </div>
  )
}

export function PropertyGrid({
  className,
  columns = 2,
  emptyValue,
  id,
  items = [],
  ...props
}) {
  const inspectorId = useInspectorId('PropertyGrid', id)

  return (
    <div
      id={inspectorId}
      className={cn('grid gap-component', columnsClass[columns] ?? columnsClass[2], className)}
      {...props}
    >
      {items.map((item) => (
        <PropertyItem
          emptyValue={item.emptyValue ?? emptyValue}
          id={item.id}
          key={item.key ?? item.label}
          label={item.label}
          labelClassName={item.labelClassName}
          value={item.value}
          valueClassName={item.valueClassName}
        />
      ))}
    </div>
  )
}
