import { CLIENT_TYPES } from '../../../entities/client'

export const clientWorkspaceSections = [
  {
    defaultPageId: 'overview',
    iconName: 'layoutDashboard',
    id: 'home',
    label: 'Home',
    pages: [
      {
        id: 'overview',
        label: 'Overview',
        previewRoute: '/admin/client-preview',
        route: '/admin/client-overview',
      },
    ],
  },
  {
    defaultPageId: 'projects',
    iconName: 'checkCircle2',
    id: 'work',
    label: 'Work',
    pages: [
      {
        id: 'projects',
        label: 'Projects',
        previewRoute: '/admin/client-projects-preview',
        route: '/admin/client-work-review',
      },
      {
        id: 'actions',
        label: 'Actions',
        previewRoute: '/admin/client-action-needed-preview',
        route: '/admin/client-requests',
      },
      {
        id: 'requests',
        label: 'Requests',
        previewRoute: '/admin/client-requests-preview',
        route: '/admin/client-submitted-requests',
      },
    ],
  },
  {
    defaultPageId: 'reports-dashboards',
    iconName: 'barChart',
    id: 'performance',
    label: 'Performance',
    pages: [
      {
        id: 'reports-dashboards',
        label: 'Reports & Dashboards',
        labelByClientType: {
          [CLIENT_TYPES.CLINIC]: 'Clinic Results',
        },
        previewRoute: '/admin/client-reports-dashboards-preview',
        route: '/admin/client-reports-dashboards',
      },
      {
        clientTypes: [CLIENT_TYPES.CLINIC],
        id: 'clinic-metrics',
        label: 'Metrics',
        previewRoute: '/admin/client-patient-acquisition-preview',
        route: '/admin/clinic-metrics',
      },
      {
        clientTypes: [CLIENT_TYPES.CLINIC],
        id: 'clinic-reporting',
        label: 'Reporting',
        previewRoute: '/client/growth-review',
        route: '/admin/clinic-reporting',
      },
      {
        clientTypes: [CLIENT_TYPES.CLINIC],
        id: 'clinic-reputation',
        label: 'Reputation',
        previewRoute: '/admin/client-reputation-preview',
        route: '/admin/clinic-reputation',
      },
      {
        clientTypes: [CLIENT_TYPES.CLINIC],
        id: 'clinic-compliance',
        label: 'Compliance',
        previewRoute: '/admin/client-compliance-approvals-preview',
        route: '/admin/clinic-compliance',
      },
    ],
  },
  {
    defaultPageId: 'updates',
    iconName: 'fileText',
    id: 'portal',
    label: 'Portal',
    pages: [
      {
        id: 'updates',
        label: 'Updates',
        previewRoute: '/admin/client-updates-preview',
        route: '/admin/client-updates',
      },
      {
        id: 'files-links',
        label: 'Files & Links',
        previewRoute: '/admin/client-files-links-preview',
        route: '/admin/client-files-links',
      },
    ],
  },
  {
    defaultPageId: 'access',
    iconName: 'users',
    id: 'access',
    label: 'Access',
    pages: [
      {
        id: 'access',
        label: 'Access',
        previewRoute: '/admin/client-settings-preview',
        route: '/admin/client-access',
      },
    ],
  },
  {
    defaultPageId: 'activity',
    iconName: 'clock',
    id: 'activity',
    label: 'Activity',
    pages: [
      {
        id: 'activity',
        label: 'Activity',
        previewRoute: '/admin/client-updates-preview',
        route: '/admin/client-activity',
      },
    ],
  },
  {
    clientTypes: [CLIENT_TYPES.CLINIC],
    defaultPageId: 'clinic-setup',
    iconName: 'stethoscope',
    id: 'setup',
    label: 'Setup',
    pages: [
      {
        id: 'clinic-setup',
        label: 'Clinic Setup',
        route: '/admin/clinic-setup',
      },
    ],
  },
]

function isVisibleForClientType(item, clientType) {
  return !item.clientTypes?.length || item.clientTypes.includes(clientType)
}

function getVisiblePages(section, clientType) {
  return section.pages.filter((page) => isVisibleForClientType(page, clientType))
}

export function getVisibleClientWorkspaceSections(client) {
  const clientType = client?.type

  return clientWorkspaceSections
    .filter((section) => isVisibleForClientType(section, clientType))
    .map((section) => ({
      ...section,
      pages: getVisiblePages(section, clientType),
    }))
    .filter((section) => section.pages.length > 0)
}

export function getClientWorkspacePageLabel(page, client) {
  return page.labelByClientType?.[client?.type] ?? page.label
}

export function getClientWorkspaceSectionHref(section, clientId) {
  const defaultPage = section.pages.find((page) => page.id === section.defaultPageId) ?? section.pages[0]

  return `${defaultPage.route}?clientId=${clientId}`
}

export function getClientWorkspacePageHref(page, clientId) {
  return `${page.route}?clientId=${clientId}`
}

export function getActiveClientWorkspaceSection(sections, currentPage) {
  return sections.find((section) => section.pages.some((page) => page.id === currentPage)) ?? sections[0]
}

export function getClientWorkspacePreviewRoute(sections, currentPage) {
  const currentPageConfig = sections
    .flatMap((section) => section.pages)
    .find((page) => page.id === currentPage)

  return currentPageConfig?.previewRoute ?? '/admin/client-preview'
}

export function getClientWorkspacePageIdByRoutePath(path) {
  const page = clientWorkspaceSections
    .flatMap((section) => section.pages)
    .find((workspacePage) => workspacePage.route === path)

  return page?.id ?? null
}

export function getClientWorkspaceSidebarItems(client, clientId) {
  return getVisibleClientWorkspaceSections(client).map((section) => {
    if (section.pages.length === 1) {
      const page = section.pages[0]

      return {
        iconName: section.iconName,
        id: page.id,
        label: getClientWorkspacePageLabel(page, client),
        path: getClientWorkspacePageHref(page, clientId),
        type: 'route',
      }
    }

    return {
      children: section.pages.map((page) => ({
        iconName: section.iconName,
        id: page.id,
        label: getClientWorkspacePageLabel(page, client),
        path: getClientWorkspacePageHref(page, clientId),
        type: 'route',
      })),
      iconName: section.iconName,
      id: section.id,
      label: section.label,
      type: 'group',
    }
  })
}
