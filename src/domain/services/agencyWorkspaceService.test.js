import { describe, expect, it } from 'vitest'

import {
  createAdminClient,
  deleteAdminClient,
  listAdminClients,
  updateAdminClient,
} from './adminClientService'
import {
  createAgencyWorkspace,
  deleteAgencyWorkspace,
  listAgencyManagedWorkspaces,
  updateAgencyWorkspace,
} from './agencyWorkspaceService'

describe('agencyWorkspaceService', () => {
  it('exposes agency workspace lifecycle aliases over the existing admin client service', () => {
    expect(createAgencyWorkspace).toBe(createAdminClient)
    expect(deleteAgencyWorkspace).toBe(deleteAdminClient)
    expect(listAgencyManagedWorkspaces).toBe(listAdminClients)
    expect(updateAgencyWorkspace).toBe(updateAdminClient)
  })
})
