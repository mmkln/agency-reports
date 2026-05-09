import agencyLogoUrl from '../../assets/agency-logo.png'

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
  const iconSizeClass = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  const textSizeClass = size === 'sm' ? 'text-lg' : 'text-xl'
  const textColorClass = light ? 'text-white' : 'text-heading'
  const shadowClass = shouldShowShadow ? 'drop-shadow-[0_8px_14px_rgb(99_102_241/0.22)]' : ''
  const rootClass = isStatic ? 'flex items-center gap-2 no-underline' : 'group flex cursor-pointer items-center gap-2 no-underline'
  const motionClass = isStatic ? '' : 'transition-transform duration-300 group-hover:scale-105'

  return (
    <a className={`${rootClass} ${className}`.trim()} href={href}>
      <span
        aria-hidden="true"
        className={`flex ${iconSizeClass} shrink-0 items-center justify-center ${shadowClass} ${motionClass}`.trim()}
      >
        <img
          alt=""
          className="h-full w-full object-contain"
          src={agencyLogoUrl}
        />
      </span>
      <span className={`${textSizeClass} font-bold tracking-tight ${textColorClass}`}>Agency Reports</span>
    </a>
  )
}
