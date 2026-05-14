import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function RangeInput({ className, id, type, ...props }) {
  const inspectorId = useInspectorId('RangeInput', id)

  void type

  return (
    <input
      id={inspectorId}
      className={cn(
        'min-h-control-small w-full cursor-pointer appearance-none rounded-full bg-control accent-action hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      type="range"
      {...props}
    />
  )
}
