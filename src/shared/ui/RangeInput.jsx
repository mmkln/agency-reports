import { cn } from '@/lib/utils'

export function RangeInput({ className, type, ...props }) {
  void type

  return (
    <input
      className={cn(
        'min-h-control-small w-full cursor-pointer appearance-none rounded-full bg-control accent-action hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      type="range"
      {...props}
    />
  )
}
