import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function Panel({ children, className = '' }) {
  return (
    <Card as="section" className={cn('flex flex-col gap-0 py-0', className)}>
      {children}
    </Card>
  )
}

export function PanelHeader({ action, children, eyebrow, subtitle, title }) {
  return (
    <CardHeader className="flex-row items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
      {title ? (
        <div>
          {eyebrow ? <p className="mb-1 text-xs font-semibold tracking-wide text-indigo-600 uppercase">{eyebrow}</p> : null}
          <h2 className="m-0 text-lg font-semibold text-slate-800">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
        </div>
      ) : (
        children
      )}
      {action ? <div className="shrink-0">{action}</div> : null}
    </CardHeader>
  )
}

export function PanelBody({ children, className = '' }) {
  return <CardContent className={cn('p-6', className)}>{children}</CardContent>
}
