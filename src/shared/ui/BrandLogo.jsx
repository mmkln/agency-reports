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
  const logoSizeClass = size === 'sm' ? 'h-7 w-40' : 'h-9 w-52'
  const imageToneClass = light ? 'invert' : 'dark:invert'
  const shadowClass = shouldShowShadow ? 'drop-shadow-[0_8px_14px_var(--premium-shadow)]' : ''
  const rootClass = isStatic ? 'flex items-center no-underline' : 'group flex cursor-pointer items-center no-underline'
  const motionClass = isStatic ? '' : 'transition-transform duration-motion-slow ease-motion-standard group-hover:scale-105'
  const resolvedHref = href.startsWith('/') ? getAppHref(href) : href

  return (
    <a className={`${rootClass} ${className}`.trim()} href={resolvedHref} id={inspectorId}>
      <span
        aria-hidden="true"
        className={`flex ${logoSizeClass} shrink-0 items-center overflow-hidden ${shadowClass} ${motionClass}`.trim()}
      >
        <img
          alt=""
          className={`h-full w-full object-contain object-left ${imageToneClass}`.trim()}
          src={agencyLogoUrl}
        />
      </span>
      <span className="sr-only">Alpine Marketing</span>
    </a>
  )
}
