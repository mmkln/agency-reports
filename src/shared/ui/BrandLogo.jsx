import { useBrand } from '../branding'
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
  const brand = useBrand()
  const inspectorId = useInspectorId('BrandLogo', id)
  const isStatic = variant === 'static'
  const shouldShowShadow = iconShadow ?? (!light && !isStatic)
  const logoSizeClass = size === 'sm' ? 'h-7 w-40' : 'h-9 w-52'
  const imageFitClass = brand.logoFit === 'cover' ? 'object-cover object-center' : 'object-contain object-left'
  const imageToneClass = brand.allowInversion === false ? '' : (light ? 'invert' : 'dark:invert')
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
          className={`h-full w-full ${imageFitClass} ${imageToneClass}`.trim()}
          src={brand.logoUrl}
        />
      </span>
      <span className="sr-only">{brand.name}</span>
    </a>
  )
}
