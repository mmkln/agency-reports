export function Tabs({ items }) {
  return (
    <nav className="flex items-center overflow-x-auto" aria-label="Dashboard pages">
      {items.map((item) => (
        <a
          className={`inline-flex min-h-11 items-center gap-2 border-b-[3px] px-[17px] text-sm font-medium whitespace-nowrap no-underline first:pl-4 ${
            item.active
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
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
