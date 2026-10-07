import { describe, expect, it } from 'vitest'

import {
  buildPluginCancellationUrl,
  parsePluginAuthorizationRequest,
  PLUGIN_CLIENT_ID,
  PLUGIN_REDIRECT_URI,
  PLUGIN_SCOPE,
} from './pluginAuthorizationRequest'

function validRequest(overrides = {}) {
  return new URLSearchParams({
    client_id: PLUGIN_CLIENT_ID,
    redirect_uri: PLUGIN_REDIRECT_URI,
    code_challenge: 'a'.repeat(43),
    code_challenge_method: 'S256',
    scope: PLUGIN_SCOPE,
    state: 'expected-state',
    ...overrides,
  })
}

describe('plugin authorization request', () => {
  it('accepts the registered local plugin callback', () => {
    expect(parsePluginAuthorizationRequest(validRequest())).toEqual({
      request: {
        client_id: PLUGIN_CLIENT_ID,
        redirect_uri: PLUGIN_REDIRECT_URI,
        code_challenge: 'a'.repeat(43),
        code_challenge_method: 'S256',
        scope: PLUGIN_SCOPE,
        state: 'expected-state',
      },
    })
  })

  it('rejects an unregistered redirect', () => {
    expect(parsePluginAuthorizationRequest(validRequest({
      redirect_uri: 'https://attacker.example/callback',
    }))).toHaveProperty('error')
  })

  it('returns cancellation only to the registered loopback callback', () => {
    expect(buildPluginCancellationUrl({ state: 'expected-state' })).toBe(
      `${PLUGIN_REDIRECT_URI}?error=access_denied&state=expected-state`,
    )
  })
})
