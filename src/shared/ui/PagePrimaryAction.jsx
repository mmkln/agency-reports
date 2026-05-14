import { Link } from 'react-router-dom'

import { Icon } from '@/shared/icons'

import { Button } from './Button'
import { useInspectorId } from './inspectorId'

const contextConfig = {
  page: {
    iconSize: 16,
    size: 'md',
  },
  workspace: {
    iconSize: 14,
    size: 'sm',
  },
}

function ActionContent({ children, iconName, iconSize }) {
  return (
    <>
      {iconName ? <Icon name={iconName} size={iconSize} /> : null}
      {children}
    </>
  )
}

export function PagePrimaryAction({
  children,
  className,
  context = 'page',
  href,
  iconName = 'plus',
  id,
  onClick,
  size,
  to,
  type = 'button',
  variant,
  ...props
}) {
  void className
  void size
  void variant

  const inspectorId = useInspectorId('PagePrimaryAction', id)
  const config = contextConfig[context] ?? contextConfig.page
  const content = (
    <ActionContent iconName={iconName} iconSize={config.iconSize}>
      {children}
    </ActionContent>
  )

  if (to) {
    return (
      <Button asChild id={inspectorId} size={config.size} {...props}>
        <Link to={to}>{content}</Link>
      </Button>
    )
  }

  if (href) {
    return (
      <Button asChild id={inspectorId} size={config.size} {...props}>
        <a href={href}>{content}</a>
      </Button>
    )
  }

  return (
    <Button id={inspectorId} onClick={onClick} size={config.size} type={type} {...props}>
      {content}
    </Button>
  )
}
