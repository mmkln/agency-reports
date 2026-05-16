import agencyLogoUrl from '../../assets/agency-logo.png'
import { getAppHref } from '../routing'
import { useInspectorId } from './inspectorId'

export function BrandLogo({
  className = '',
  href = '/',
  id,
  iconShadow,
  light = false,
  size = 'md',
  variant = 'interactive',
}) {
  const inspectorId = useInspectorId('BrandLogo', id)
  const isStatic = variant === 'static'
  const shouldShowShadow = iconShadow ?? (!light && !isStatic)
  const iconSizeClass = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  const textSizeClass = size === 'sm' ? 'text-ui' : 'text-heading'
  const textColorClass = light ? 'text-text-inverted' : 'text-text-primary'
  const shadowClass = shouldShowShadow ? 'drop-shadow-[0_8px_14px_var(--premium-shadow)]' : ''
  const rootClass = isStatic ? 'flex items-center gap-2 no-underline' : 'group flex cursor-pointer items-center gap-2 no-underline'
  const motionClass = isStatic ? '' : 'transition-transform duration-motion-slow ease-motion-standard group-hover:scale-105'
  const resolvedHref = href.startsWith('/') ? getAppHref(href) : href

  return (
    <a className={`${rootClass} ${className}`.trim()} href={resolvedHref} id={inspectorId}>
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
      <span className={`${textSizeClass} ${textColorClass}`}>Agency Reports</span>
    </a>
  )
}
