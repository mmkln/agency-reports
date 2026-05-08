export function BrandLogo({
  className = '',
  href = '#landing',
  iconShadow,
  light = false,
  size = 'md',
  variant = 'interactive',
}) {
  const isStatic = variant === 'static'
  const shouldShowShadow = iconShadow ?? (!light && !isStatic)
  const iconSizeClass = size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-xl'
  const textSizeClass = size === 'sm' ? 'text-lg' : 'text-xl'
  const textColorClass = light ? 'text-white' : 'text-heading'
  const shadowClass = shouldShowShadow ? 'shadow-lg shadow-indigo-200' : ''
  const rootClass = isStatic ? 'flex items-center gap-2 no-underline' : 'group flex cursor-pointer items-center gap-2 no-underline'
  const motionClass = isStatic ? '' : 'transition-transform duration-300 group-hover:scale-105'

  return (
    <a className={`${rootClass} ${className}`.trim()} href={href}>
      <div
        className={`flex ${iconSizeClass} items-center justify-center bg-brand ${shadowClass} ${motionClass}`.trim()}
      >
        <span className="text-xl leading-none font-black text-white">D</span>
      </div>
      <span className={`${textSizeClass} font-bold tracking-tight ${textColorClass}`}>DentalFlow</span>
    </a>
  )
}
