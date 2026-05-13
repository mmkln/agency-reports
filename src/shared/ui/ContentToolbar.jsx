import { cn } from '@/lib/utils'

export function ContentToolbar({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-component rounded-block bg-block-subtle p-component',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
