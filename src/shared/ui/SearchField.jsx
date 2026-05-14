import { useId } from 'react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

import { Icon } from '../icons'
import { useInspectorId } from './inspectorId'

export function SearchField({
  className,
  id,
  inputClassName,
  inputId,
  label = 'Search',
  onChange,
  onValueChange,
  placeholder = 'Search',
  type = 'text',
  ...props
}) {
  const inspectorId = useInspectorId('SearchField', id)
  const generatedInputId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const resolvedInputId = inputId ?? `${inspectorId}-input-${generatedInputId}`

  function handleChange(event) {
    onChange?.(event)
    onValueChange?.(event.target.value, event)
  }

  return (
    <label
      className={cn(
        'flex h-control-small min-w-0 flex-1 items-center gap-item rounded-control border border-transparent bg-control px-control transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/35',
        className,
      )}
      htmlFor={resolvedInputId}
      id={inspectorId}
    >
      <span className="sr-only">{label}</span>
      <Icon className="pointer-events-none text-text-secondary" name="search" size={15} />
      <Input
        className={cn(
          'h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-sm shadow-none hover:bg-transparent focus-visible:ring-0',
          inputClassName,
        )}
        id={resolvedInputId}
        onChange={handleChange}
        placeholder={placeholder}
        type={type}
        {...props}
      />
    </label>
  )
}
