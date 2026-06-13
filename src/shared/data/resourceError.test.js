import { describe, expect, it } from 'vitest'

import { BackendApiError } from '../api/backendApiClient'
import { normalizeResourceError } from './resourceError'

describe('normalizeResourceError', () => {
  it('maps unauthenticated errors to unauthenticated states', () => {
    expect(normalizeResourceError(new BackendApiError('Authentication required.', { status: 401 }))).toEqual({
      kind: 'unauthenticated',
      message: 'Authentication required.',
      status: 401,
    })
  })

  it('maps session-expired errors to session-expired states', () => {
    expect(normalizeResourceError(new BackendApiError('Your session expired. Sign in again.', {
      code: 'session_expired',
      status: 401,
    }))).toEqual({
      kind: 'session-expired',
      message: 'Your session expired. Sign in again.',
      status: 401,
    })
  })

  it('maps forbidden errors to forbidden states', () => {
    expect(normalizeResourceError(new BackendApiError('Forbidden', { status: 403 }))).toEqual({
      kind: 'forbidden',
      message: 'Forbidden',
      status: 403,
    })
  })

  it('maps bad requests to validation states', () => {
    expect(normalizeResourceError(new BackendApiError('Invalid input', { status: 400 }))).toEqual({
      kind: 'validation',
      message: 'Invalid input',
      status: 400,
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
