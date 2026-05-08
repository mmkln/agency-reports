export function Button({
  children,
  className = '',
  icon,
  size = 'md',
  variant = 'primary',
  ...props
}) {
  const baseClass = 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-transparent font-bold leading-none transition duration-150 ease-in-out hover:-translate-y-px focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/25'
  const sizeClass = {
    sm: 'min-h-9 px-3.5 text-sm',
    md: 'min-h-9 px-[18px] text-[0.94rem]',
  }[size]
  const variantClass = {
    primary: 'bg-brand text-white shadow-md shadow-indigo-100 hover:bg-brand-hover',
    ghost: 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
  }[variant]

  return (
    <button className={`${baseClass} ${sizeClass} ${variantClass} ${className}`.trim()} {...props}>
      {icon ? <span className="inline-flex text-[0.95em]" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </button>
  )
}
