import { cn } from '@/lib/utils'

export function PageShell({ children, className, ...props }) {
  return (
    <div
      className={cn('mx-auto flex w-full max-w-content flex-col gap-card', className)}
      {...props}
    >
      {children}
    </div>
  )
}
