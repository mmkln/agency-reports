import { iconRegistry } from './iconRegistry'

export function Icon({ className = '', name, size, title, ...props }) {
  const icon = iconRegistry[name]

  if (!icon) {
    return null
  }

  const iconSize = size ?? icon.defaultSize
  const accessibilityProps = title
    ? { 'aria-label': title, role: 'img' }
    : { 'aria-hidden': true }

  return (
    <svg
      className={`inline-block shrink-0 align-middle text-current ${className}`.trim()}
      fill="none"
      height={iconSize}
      viewBox={icon.viewBox}
      width={iconSize}
      xmlns="http://www.w3.org/2000/svg"
      {...accessibilityProps}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {icon.paths}
    </svg>
  )
}
