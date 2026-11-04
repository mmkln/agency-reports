import { describe, expect, it } from 'vitest'

import {
  getClientWorkspacePageHref,
  getVisibleClientWorkspaceSections,
  getWorkspaceActiveNavigationId,
  getWorkspaceAccessPath,
  getWorkspaceDataSourcesPath,
  getWorkspaceExecutivePath,
  getWorkspaceLeadReportPath,
  getWorkspaceNavigationPages,
  getWorkspaceReviewPath,
  getWorkspaceReviewSetupPath,
  getWorkspaceSetupPath,
  getWorkspaceTagCatalogPath,
} from './index'

describe('admin workspace paths', () => {
  it('builds canonical agency workspace paths', () => {
    expect(getWorkspaceSetupPath('workspace_1')).toBe('/agency/workspaces/workspace_1/setup')
    expect(getWorkspaceDataSourcesPath('workspace_1')).toBe('/agency/workspaces/workspace_1/data')
    expect(getWorkspaceTagCatalogPath('workspace_1')).toBe('/agency/workspaces/workspace_1/tag-catalog')
    expect(getWorkspaceReviewSetupPath('workspace_1')).toBe('/agency/workspaces/workspace_1/review-setup')
    expect(getWorkspaceReviewPath('workspace_1')).toBe('/agency/workspaces/workspace_1/review')
    expect(getWorkspaceLeadReportPath('workspace_1')).toBe('/agency/workspaces/workspace_1/lead-report')
    expect(getWorkspaceExecutivePath('workspace_1')).toBe('/agency/workspaces/workspace_1/executive')
    expect(getWorkspaceAccessPath('workspace_1')).toBe('/agency/workspaces/workspace_1/access')
  })

  it('keeps agency workspace tabs out of portal routes', () => {
    const sections = getVisibleClientWorkspaceSections()
    const tabHrefs = getWorkspaceNavigationPages(sections)
      .map((page) => getClientWorkspacePageHref(page, 'workspace_1'))

    expect(tabHrefs).toEqual([
      '/agency/workspaces/workspace_1/setup',
      '/agency/workspaces/workspace_1/data',
      '/agency/workspaces/workspace_1/access',
      '/agency/workspaces/workspace_1/review',
      '/agency/workspaces/workspace_1/lead-report',
      '/agency/workspaces/workspace_1/executive',
    ])
    expect(tabHrefs.some((href) => href.startsWith('/portal/'))).toBe(false)
  })

  it('keeps child routes addressable while selecting their owning workspace destination', () => {
    const sections = getVisibleClientWorkspaceSections()

    expect(getWorkspaceActiveNavigationId(sections, 'tag-catalog')).toBe('data')
    expect(getWorkspaceActiveNavigationId(sections, 'review-setup')).toBe('review')
    expect(getWorkspaceActiveNavigationId(sections, 'lead-report')).toBe('lead-report')
  })
})
