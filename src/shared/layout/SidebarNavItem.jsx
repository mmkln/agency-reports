import { Link } from 'react-router-dom'

import { Icon } from '../icons'
import {
  sidebarIconSlotClass,
  sidebarLabelClass,
  sidebarRowClass,
} from './appSidebarStyles'

export function SidebarNavItem({ isActive, route }) {
  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={sidebarRowClass({ isActive, tone: 'nav' })}
      title={route.navLabel ?? route.label}
      to={route.path}
    >
      <span className={sidebarIconSlotClass}>
        <Icon className="text-current" name={route.iconName} size={18} />
      </span>
      <span className={sidebarLabelClass}>{route.navLabel ?? route.label}</span>
    </Link>
  )
}
