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
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../ui'
import { Icon } from '../icons'
import { AccountMenu } from './AccountMenu'
import {
  defaultSidebarViewerMeta,
} from './appSidebarStyles'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarSearch } from './SidebarSearch'

const routeSidebarSectionMeta = {
  analytics: {
    label: 'Analytics',
    order: 20,
  },
  performance: {
    label: 'Performance',
    order: 20,
  },
  systems: {
    label: 'Systems',
    order: 30,
  },
  workspace: {
    label: 'Workspace',
    order: 10,
  },
}

const agencyWorkspaceRouteIds = new Set([
  'admin-clients',
  'admin-tasks',
  'team-tasks',
])

const agencyAnalyticsRouteIds = new Set([
  'admin-dashboard-links',
  'admin-performance-dashboards',
  'admin-reports',
  'team-clinic-operator',
  'clinic-daily-ops',
])

const clientWorkspaceRouteIds = new Set([
  'client-overview',
  'client-action-needed',
  'client-projects',
])

const clientPerformanceRouteIds = new Set([
  'client-executive-performance',
  'client-monthly-strategy',
  'dental-growth-review',
  'executive-dashboard',
  'client-reports-dashboards',
  'client-patient-acquisition',
  'client-calls-bookings',
  'client-service-lines',
  'client-reputation',
  'clinic-daily-ops',
])

function getRouteSidebarSectionId(route) {
  if (clientWorkspaceRouteIds.has(route.id)) {
    return 'workspace'
  }

  if (clientPerformanceRouteIds.has(route.id)) {
    return 'performance'
  }

  if (route.path?.startsWith('/portal/')) {
    return 'systems'
  }

  if (agencyWorkspaceRouteIds.has(route.id)) {
    return 'workspace'
  }

  if (agencyAnalyticsRouteIds.has(route.id)) {
    return 'analytics'
  }

  return 'systems'
}

function createRouteItem(route, index) {
  return {
    iconName: route.iconName,
    id: route.id,
    label: route.navLabel ?? route.label,
    order: route.navGroup?.order ?? route.navOrder ?? index,
    path: route.path,
    route,
    type: 'route',
  }
}

function createSidebarNavItems(routes) {
  const sections = new Map()

  routes.forEach((route, index) => {
    const sectionId = getRouteSidebarSectionId(route)
    const sectionMeta = routeSidebarSectionMeta[sectionId] ?? routeSidebarSectionMeta.systems
    const section = sections.get(sectionId) ?? {
      children: [],
      id: sectionId,
      label: sectionMeta.label,
      order: sectionMeta.order,
      type: 'section',
    }

    section.children.push(createRouteItem(route, index))
    sections.set(sectionId, section)
  })

  return [...sections.values()]
    .map((section) => ({
      ...section,
      children: section.children.sort((a, b) => a.order - b.order),
    }))
    .filter((section) => section.children.length > 0)
    .sort((a, b) => a.order - b.order)
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

function SidebarNavGroup({ activeNavigationId, group, isExpanded, onExpandedChange }) {
  const isActive = group.children.some((route) => route.id === activeNavigationId)
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
              const childActive = route.id === activeNavigationId

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

function SidebarNavSection({ activeNavigationId, section }) {
  return (
    <>
      <SidebarMenuItem
        className="mt-control first:mt-0 group-data-[collapsible=icon]:hidden"
        key={`${section.id}-heading`}
      >
        <div className="px-control pb-tag pt-item text-label font-semibold uppercase text-text-muted">
          {section.label}
        </div>
      </SidebarMenuItem>
      {section.children.map((route) => (
        <SidebarNavItem
          isActive={route.id === activeNavigationId}
          key={route.id}
          route={route}
        />
      ))}
    </>
  )
}

export function AppSidebar({
  activeRoute,
  activeNavigationId,
  hasUnsavedChanges = false,
  navigationItems,
  onAuthChange,
  onSignOut,
  runtime,
  routes,
  viewerMeta,
  workspaceSwitcher,
}) {
  const viewer = runtime.viewer
  const activeRole = viewerMeta ?? defaultSidebarViewerMeta
  const workspaceSettingsRoute = routes.find((route) => (
    route.id === 'client-settings' && route.showInNav !== false
  )) ?? null
  const primaryRoutes = useMemo(
    () => routes.filter((route) => (
      route.showInNav !== false
      && route.id !== 'client-settings'
      && route.id !== 'account-settings'
    )),
    [routes],
  )
  const routeNavItems = useMemo(() => createSidebarNavItems(primaryRoutes), [primaryRoutes])
  const navItems = navigationItems ?? routeNavItems
  const resolvedActiveNavigationId = activeNavigationId ?? activeRoute.id
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
      <SidebarHeader className="flex min-w-0 flex-row items-center gap-item">
        <BrandLogo
          className="min-w-0 flex-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span:first-child]:w-8"
          href="/"
          size="sm"
          variant="static"
        />
        <SidebarTrigger
          aria-label="Toggle sidebar"
          className="shrink-0 text-text-muted group-data-[collapsible=icon]:hidden"
          title="Toggle sidebar"
        />
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
              if (item.type === 'section') {
                return (
                  <SidebarNavSection
                    activeNavigationId={resolvedActiveNavigationId}
                    key={item.id}
                    section={item}
                  />
                )
              }

              if (item.type === 'group') {
                return (
                  <SidebarNavGroup
                    activeNavigationId={resolvedActiveNavigationId}
                    group={item}
                    isExpanded={expandedGroups.has(item.id)}
                    key={item.id}
                    onExpandedChange={(isExpanded) => setGroupExpanded(item.id, isExpanded)}
                  />
                )
              }

              const route = item.route ?? item

              return (
                <SidebarNavItem
                  isActive={route.id === resolvedActiveNavigationId}
                  key={route.id}
                  route={route}
                />
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {workspaceSwitcher}
          <SidebarSettingsItem
            isActive={activeRoute.id === workspaceSettingsRoute?.id}
            route={workspaceSettingsRoute}
          />
          <AccountMenu
            activeRole={activeRole}
            hasUnsavedChanges={hasUnsavedChanges}
            onSignOut={onSignOut ?? onAuthChange}
            viewer={viewer}
          />
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
