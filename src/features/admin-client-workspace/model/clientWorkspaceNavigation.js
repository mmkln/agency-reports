import { CLIENT_TYPES } from '../../../entities/client'
import {
  getWorkspaceDataSourcesPath,
  getWorkspaceReviewPath,
  getWorkspaceSetupPath,
} from './adminWorkspacePaths'

export const clientWorkspaceSections = [
  {
    clientTypes: [CLIENT_TYPES.CLINIC],
    defaultPageId: 'clinic-setup',
    iconName: 'settings',
    id: 'client-workspace',
    label: 'Client workspace',
    pages: [
      {
        id: 'clinic-setup',
        iconName: 'settings',
        label: 'Setup',
        route: '/admin/clinic-setup',
        to: getWorkspaceSetupPath,
      },
      {
        id: 'clinic-data-sources',
        iconName: 'database',
        label: 'Data',
        previewRoute: '/client/growth-review',
        route: '/admin/clinic-data-sources',
        to: getWorkspaceDataSourcesPath,
      },
      {
        id: 'clinic-review',
        iconName: 'trendingUp',
        label: 'Review',
        route: '/admin/clinic-review',
        to: getWorkspaceReviewPath,
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

  return getClientWorkspacePageHref(defaultPage, clientId)
}

export function getClientWorkspacePageHref(page, clientId) {
  return page.to ? page.to(clientId) : `${page.route}?workspaceId=${clientId}`
}

export function getActiveClientWorkspaceSection(sections, currentPage) {
  return sections.find((section) => section.pages.some((page) => page.id === currentPage)) ?? sections[0]
}

export function getClientWorkspacePreviewRoute(sections, currentPage) {
  const currentPageConfig = sections
    .flatMap((section) => section.pages)
    .find((page) => page.id === currentPage)

  return currentPageConfig?.previewRoute ?? '/client/growth-review'
}

export function getClientWorkspacePageIdByRoutePath(path) {
  const page = clientWorkspaceSections
    .flatMap((section) => section.pages)
    .find((workspacePage) => workspacePage.route === path)

  return page?.id ?? null
}

export function getClientWorkspaceSidebarItems(client, clientId) {
  const sections = getVisibleClientWorkspaceSections(client)

  return sections.map((section) => ({
    children: section.pages.map((page) => ({
      iconName: page.iconName ?? section.iconName,
      id: page.id,
      label: getClientWorkspacePageLabel(page, client),
      path: getClientWorkspacePageHref(page, clientId),
      type: 'route',
    })),
    id: section.id,
    label: section.label,
    type: 'section',
  }))
}
