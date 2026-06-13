import { matchPath } from 'react-router-dom'

import { ROUTE_PATHS } from '../../../domain/navigation/routePaths'
import {
  getWorkspaceAccessPath,
  getWorkspaceDataSourcesPath,
  getWorkspaceReviewPath,
  getWorkspaceReviewSetupPath,
  getWorkspaceSetupPath,
} from './adminWorkspacePaths'

export const clientWorkspaceSections = [
  {
    defaultPageId: 'setup',
    iconName: 'settings',
    id: 'client-workspace',
    label: 'Client workspace',
    pages: [
      {
        id: 'setup',
        iconName: 'settings',
        label: 'Setup',
        route: ROUTE_PATHS.agencyWorkspaceSetup,
        to: getWorkspaceSetupPath,
      },
      {
        id: 'data',
        iconName: 'database',
        label: 'Data',
        route: ROUTE_PATHS.agencyWorkspaceData,
        to: getWorkspaceDataSourcesPath,
      },
      {
        id: 'review-setup',
        iconName: 'settings',
        label: 'Review Setup',
        route: ROUTE_PATHS.agencyWorkspaceReviewSetup,
        to: getWorkspaceReviewSetupPath,
      },
      {
        id: 'review',
        iconName: 'trendingUp',
        label: 'Review',
        route: ROUTE_PATHS.agencyWorkspaceReview,
        to: getWorkspaceReviewPath,
      },
      {
        id: 'access',
        iconName: 'users',
        label: 'Access',
        route: ROUTE_PATHS.agencyWorkspaceAccess,
        to: getWorkspaceAccessPath,
      },
    ],
  },
]

export function getVisibleClientWorkspaceSections() {
  return clientWorkspaceSections
    .map((section) => ({
      ...section,
      pages: section.pages,
    }))
    .filter((section) => section.pages.length > 0)
}

export function getClientWorkspacePageLabel(page) {
  return page.label
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

  return currentPageConfig?.previewRoute ?? ROUTE_PATHS.portalWorkspaceReview
}

export function getClientWorkspacePageIdByRoutePath(path) {
  const page = clientWorkspaceSections
    .flatMap((section) => section.pages)
    .find((workspacePage) => matchPath({ end: true, path: workspacePage.route }, path))

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
