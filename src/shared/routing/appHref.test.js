import { afterEach, describe, expect, it, vi } from 'vitest'

import { getAbsoluteAppHref, getAppHref } from './appHref'

describe('app href routing adapter', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('builds browser routing hrefs with the configured app base', () => {
    vi.stubEnv('BASE_URL', '/agency-reports/')
    vi.stubEnv('VITE_ROUTING_MODE', 'browser')

    expect(getAppHref('/login')).toBe('/agency-reports/login')
    expect(getAppHref('/client/growth-review?clientId=clinic_1')).toBe(
      '/agency-reports/client/growth-review?clientId=clinic_1',
    )
  })

  it('builds hash routing hrefs with the configured app base', () => {
    vi.stubEnv('BASE_URL', '/agency-reports/')
    vi.stubEnv('VITE_ROUTING_MODE', 'hash')

    expect(getAppHref('/login')).toBe('/agency-reports/#/login')
    expect(getAppHref('/client/growth-review?clientId=clinic_1')).toBe(
      '/agency-reports/#/client/growth-review?clientId=clinic_1',
    )
  })

  it('preserves the root app href for both routing modes', () => {
    vi.stubEnv('BASE_URL', '/agency-reports/')
    vi.stubEnv('VITE_ROUTING_MODE', 'browser')

    expect(getAppHref('/')).toBe('/agency-reports/')

    vi.stubEnv('VITE_ROUTING_MODE', 'hash')

    expect(getAppHref('/')).toBe('/agency-reports/#/')
  })

  it('normalizes relative app paths', () => {
    vi.stubEnv('BASE_URL', '/agency-reports/')
    vi.stubEnv('VITE_ROUTING_MODE', 'hash')

    expect(getAppHref('accept-invite?token=abc')).toBe('/agency-reports/#/accept-invite?token=abc')
  })

  it('builds absolute app hrefs from the current origin', () => {
    vi.stubEnv('BASE_URL', '/agency-reports/')
    vi.stubEnv('VITE_ROUTING_MODE', 'hash')
    vi.stubGlobal('window', {
      location: {
        origin: 'https://example.github.io',
      },
    })

    expect(getAbsoluteAppHref('/accept-invite?token=abc')).toBe(
      'https://example.github.io/agency-reports/#/accept-invite?token=abc',
    )
  })
})
