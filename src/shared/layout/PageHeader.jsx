import { PagePrimaryAction } from '@/shared/ui'

export function PageHeader({ actions, primaryAction, title }) {
  const renderedActions = (
    <>
      {actions}
      {primaryAction ? <PagePrimaryAction {...primaryAction} /> : null}
    </>
  )

  return (
    <header className="border-b border-separator bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-2xl leading-7 font-bold text-text-primary transition-all sm:truncate sm:text-3xl">
            {title}
          </h1>
        </div>
        {actions || primaryAction ? <div className="mt-5 flex gap-3 lg:mt-0 lg:ml-4">{renderedActions}</div> : null}
      </div>
    </header>
  )
}
