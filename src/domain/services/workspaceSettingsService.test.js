import { describe, expect, it } from 'vitest'

import { getClientSettingsPage } from './clientSettingsService'
import { getWorkspaceSettingsPage } from './workspaceSettingsService'

describe('workspaceSettingsService', () => {
  it('exposes the workspace settings read model through workspace vocabulary', () => {
    expect(getWorkspaceSettingsPage).toBe(getClientSettingsPage)
  })
})
