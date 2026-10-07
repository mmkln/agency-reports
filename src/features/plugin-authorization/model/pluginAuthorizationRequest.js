export const PLUGIN_CLIENT_ID = 'alpine-growth-review-codex'
export const PLUGIN_REDIRECT_URI = 'http://127.0.0.1:53682/callback'
export const PLUGIN_SCOPE = 'growth_review.assistant'

const PKCE_CHALLENGE_PATTERN = /^[A-Za-z0-9_-]{43,128}$/

export function parsePluginAuthorizationRequest(searchParams) {
  const request = {
    client_id: searchParams.get('client_id') ?? '',
    redirect_uri: searchParams.get('redirect_uri') ?? '',
    code_challenge: searchParams.get('code_challenge') ?? '',
    code_challenge_method: searchParams.get('code_challenge_method') ?? '',
    scope: searchParams.get('scope') ?? '',
    state: searchParams.get('state') ?? '',
  }

  if (request.client_id !== PLUGIN_CLIENT_ID || request.redirect_uri !== PLUGIN_REDIRECT_URI) {
    return { error: 'This connection request did not come from the Alpine Growth Review plugin.' }
  }
  if (
    request.code_challenge_method !== 'S256'
    || !PKCE_CHALLENGE_PATTERN.test(request.code_challenge)
  ) {
    return { error: 'The plugin connection request is incomplete or invalid.' }
  }
  if (request.scope !== PLUGIN_SCOPE || !request.state || request.state.length > 256) {
    return { error: 'The plugin requested unsupported access.' }
  }

  return { request }
}

export function buildPluginCancellationUrl(request) {
  const callback = new URL(PLUGIN_REDIRECT_URI)
  callback.searchParams.set('error', 'access_denied')
  callback.searchParams.set('state', request.state)
  return callback.toString()
}
