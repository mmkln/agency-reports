import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../ui'
import { Icon } from '../icons'
import { AccountMenu } from './AccountMenu'
import {
  roleMeta,
} from './appSidebarStyles'
import { NotificationsMenu } from './NotificationsMenu'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarSearch } from './SidebarSearch'

function createSidebarNavItems(routes) {
  const groups = new Map()
  const items = []

  routes.forEach((route, index) => {
    if (!route.navGroup) {
      items.push({
        id: route.id,
        order: route.navOrder ?? index,
        route,
        type: 'route',
      })
      return
    }

    let group = groups.get(route.navGroup.id)

    if (!group) {
      group = {
        children: [],
        iconName: route.navGroup.iconName,
        id: route.navGroup.id,
        label: route.navGroup.label,
        order: route.navGroup.order ?? route.navOrder ?? index,
        type: 'group',
      }
      groups.set(route.navGroup.id, group)
      items.push(group)
    }

    group.children.push(route)
  })

  return items
    .filter((item) => item.type !== 'group' || item.children.length > 0)
    .sort((a, b) => a.order - b.order)
}

function SidebarToggleItem() {
  const { state, toggleSidebar } = useSidebar()
  const label = state === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        aria-label={label}
        onClick={toggleSidebar}
        title={label}
        tooltip={label}
        type="button"
        variant="quiet"
      >
        <Icon className="text-current" name="menu" size={18} />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarSettingsItem({ isActive, route }) {
  if (!route) {
    return null
  }

  const label = route.navLabel ?? route.label

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={label} variant="quiet">
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

function SidebarNavGroup({ activeRoute, group, isExpanded, onExpandedChange }) {
  const isActive = group.children.some((route) => route.id === activeRoute.id)
  const isOpen = isActive || isExpanded

  return (
    <Collapsible onOpenChange={onExpandedChange} open={isOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            aria-expanded={isOpen}
            isActive={isActive}
            tooltip={group.label}
            type="button"
          >
            <Icon className="text-current" name={group.iconName} size={18} />
            <span className="flex min-w-0 items-center justify-between gap-item">
              <span className="truncate">{group.label}</span>
              <Icon
                className={`shrink-0 text-text-quaternary transition-transform duration-motion-fast ease-motion-standard ${isOpen ? 'rotate-180' : ''}`}
                name="chevronDown"
                size={14}
              />
            </span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.children.map((route) => {
              const label = route.navLabel ?? route.label
              const childActive = route.id === activeRoute.id

              return (
                <SidebarMenuSubItem key={route.id}>
                  <SidebarMenuSubButton asChild isActive={childActive}>
                    <Link
                      aria-current={childActive ? 'page' : undefined}
                      title={label}
                      to={route.path}
                    >
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function AppSidebar({
  activeRoute,
  hasUnsavedChanges = false,
  onAuthChange,
  runtime,
  routes,
}) {
  const viewer = runtime.viewer
  const activeRole = roleMeta[viewer.role] ?? {
    label: viewer.role,
    searchPlaceholder: 'Search...',
  }
  const settingsRoute = routes.find((route) => route.id === 'client-settings') ?? null
  const primaryRoutes = useMemo(
    () => routes.filter((route) => route.id !== 'client-settings'),
    [routes],
  )
  const navItems = useMemo(() => createSidebarNavItems(primaryRoutes), [primaryRoutes])
  const [expandedGroups, setExpandedGroups] = useState(() => new Set())

  function setGroupExpanded(groupId, isExpanded) {
    setExpandedGroups((current) => {
      const next = new Set(current)

      if (isExpanded) {
        next.add(groupId)
      } else {
        next.delete(groupId)
      }

      return next
    })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Reports Workspace">
              <BrandLogo
                className="[&>span:last-child]:whitespace-nowrap"
                href="/"
                size="sm"
                variant="static"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarToggleItem />
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarSearch placeholder={activeRole.searchPlaceholder} />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu aria-label="Primary navigation">
            {navItems.map((item) => {
              if (item.type === 'group') {
                return (
                  <SidebarNavGroup
                    activeRoute={activeRoute}
                    group={item}
                    isExpanded={expandedGroups.has(item.id)}
                    key={item.id}
                    onExpandedChange={(isExpanded) => setGroupExpanded(item.id, isExpanded)}
                  />
                )
              }

              return (
                <SidebarNavItem
                  isActive={item.route.id === activeRoute.id}
                  key={item.route.id}
                  route={item.route}
                />
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <NotificationsMenu />
          <SidebarSettingsItem
            isActive={activeRoute.id === settingsRoute?.id}
            route={settingsRoute}
          />
          <AccountMenu
            activeRole={activeRole}
            hasUnsavedChanges={hasUnsavedChanges}
            onAuthChange={onAuthChange}
            viewer={viewer}
          />
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
