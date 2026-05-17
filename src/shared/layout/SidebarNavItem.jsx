import { Link } from 'react-router-dom'

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Icon } from '../icons'

export function SidebarNavItem({ isActive, route }) {
  const label = route.navLabel ?? route.label

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
        <Link
          aria-current={isActive ? 'page' : undefined}
          title={label}
          to={route.path}
        >
          <Icon className="text-current" name={route.iconName} size={18} />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
