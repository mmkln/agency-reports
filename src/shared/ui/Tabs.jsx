import { useInspectorId } from './inspectorId'

export function Tabs({ id, items }) {
  const inspectorId = useInspectorId('Tabs', id)

  return (
    <nav id={inspectorId} className="flex items-center overflow-x-auto" aria-label="Dashboard pages">
      {items.map((item) => (
        <a
          className={`inline-flex min-h-target items-center gap-item rounded-full px-component text-ui whitespace-nowrap no-underline transition-colors duration-motion-fast ease-motion-standard first:ml-component ${
            item.active
              ? 'bg-control-selected text-text-primary'
              : 'text-text-secondary hover:bg-control-hover hover:text-text-primary'
          }`}
          href={item.href}
          key={item.href}
        >
          {item.icon ? (
            <span
              className="inline-flex h-5 w-5 items-center justify-center"
              aria-hidden="true"
            >
              {item.icon}
            </span>
          ) : null}
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  )
}
