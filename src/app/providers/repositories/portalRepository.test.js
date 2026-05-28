import { describe, expect, it } from 'vitest'

import { createApiPortalDataClient } from './createApiPortalDataClient'
import { createDevPortalSnapshotMiddleware, createDevPortalSnapshotStore } from './createDevPortalSnapshotMiddleware'
import { createPortalDataClient } from './createPortalDataClient'
import { createPortalRepository } from './createPortalRepository'
import { createSnapshotPortalDataClient } from './createSnapshotPortalDataClient'
import { portalRepository } from './portalRepository'

describe('portalRepository', () => {
  it('does not expose a local runtime repository', () => {
    expect(() => portalRepository.reset()).toThrow('Local portal repository runtime was removed')
    expect(() => createPortalRepository()).toThrow('Local portal repository adapters were removed')
  })

  it('does not expose snapshot or local data-client runtimes', () => {
    expect(() => createPortalDataClient()).toThrow('Portal data client adapters were removed')
    expect(() => createApiPortalDataClient()).toThrow('Portal snapshot API data client was removed')
    expect(() => createSnapshotPortalDataClient()).toThrow('Portal snapshot data client was removed')
    expect(() => createDevPortalSnapshotStore()).toThrow('Development portal snapshot store was removed')
    expect(() => createDevPortalSnapshotMiddleware()).toThrow('Development portal snapshot middleware was removed')
  })
})
