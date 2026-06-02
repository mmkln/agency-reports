import { describe, expect, it } from 'vitest'

import { BackendApiError } from '../api/backendApiClient'
import { normalizeResourceError } from './resourceError'

describe('normalizeResourceError', () => {
  it('maps access errors to permission states', () => {
    expect(normalizeResourceError(new BackendApiError('Forbidden', { status: 403 }))).toEqual({
      kind: 'permission',
      message: 'Forbidden',
      status: 403,
    })
  })

  it('maps missing backend resources to not-found states', () => {
    expect(normalizeResourceError(new BackendApiError('Missing', { status: 404 }))).toEqual({
      kind: 'not-found',
      message: 'Missing',
      status: 404,
    })
  })

  it('keeps generic backend failures scoped as failures', () => {
    expect(normalizeResourceError(new BackendApiError('Backend request failed.', { status: 500 }))).toEqual({
      kind: 'failure',
      message: 'Backend request failed.',
      status: 500,
    })
  })
})
