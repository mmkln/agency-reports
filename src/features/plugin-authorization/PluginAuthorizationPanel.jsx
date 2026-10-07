import { useState } from 'react'

import { Icon } from '@/shared/icons'
import { BrandLogo, Button, CardContent, PrimitiveCard as Card } from '@/shared/ui'

import { authorizePlugin } from './api/pluginAuthorizationApi'
import { buildPluginCancellationUrl } from './model/pluginAuthorizationRequest'

export function PluginAuthorizationPanel({ apiClient, requestResult, viewer }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const request = requestResult.request

  async function handleAllow() {
    if (!request || status === 'submitting') return

    setStatus('submitting')
    setError('')
    try {
      const response = await authorizePlugin(apiClient, request)
      window.location.replace(response.redirect_url)
    } catch (caughtError) {
      setStatus('idle')
      setError(caughtError.message || 'The plugin could not be connected.')
    }
  }

  function handleCancel() {
    if (!request) return
    window.location.replace(buildPluginCancellationUrl(request))
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background-grouped-tertiary px-app-gutter py-page text-text-primary">
      <Card className="w-full max-w-modal-lg border border-block-border bg-block shadow-block">
        <CardContent className="grid gap-panel p-panel sm:p-page">
          <BrandLogo href="/" size="sm" variant="static" />

          <div className="grid gap-component">
            <span className="flex size-control-large items-center justify-center rounded-control bg-info-muted text-info-foreground">
              <Icon name="shieldCheck" size={22} />
            </span>
            <div className="grid gap-micro">
              <h1 className="text-heading font-semibold text-text-primary">Connect your AI assistant</h1>
              <p className="text-body text-text-secondary">
                Allow this assistant to securely access the Growth Review data available to your account.
              </p>
            </div>
          </div>

          {requestResult.error ? (
            <div className="rounded-block bg-danger-muted p-card text-ui text-danger-foreground" role="alert">
              {requestResult.error}
            </div>
          ) : (
            <>
              <div className="grid gap-item rounded-block bg-block-subtle p-card">
                <p className="text-label text-text-secondary">SIGNED IN AS</p>
                <div>
                  <p className="text-ui font-semibold text-text-primary">{viewer?.name || viewer?.email}</p>
                  {viewer?.email && viewer.email !== viewer.name ? (
                    <p className="text-ui text-text-secondary">{viewer.email}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-item">
                <p className="text-ui font-semibold text-text-primary">This assistant will be able to</p>
                <ul className="grid gap-item text-ui text-text-secondary">
                  <li className="flex gap-item"><Icon name="check" size={16} /> Inspect review setup and mappings</li>
                  <li className="flex gap-item"><Icon name="check" size={16} /> Read refresh status and calculated dashboards</li>
                  <li className="flex gap-item"><Icon name="check" size={16} /> Access only workspaces already available to you</li>
                </ul>
              </div>

              {error ? <p className="text-ui text-danger-foreground" role="alert">{error}</p> : null}

              <div className="flex flex-col-reverse gap-item sm:flex-row sm:justify-end">
                <Button disabled={status === 'submitting'} onClick={handleCancel} variant="ghost">
                  Cancel
                </Button>
                <Button disabled={status === 'submitting'} onClick={handleAllow}>
                  {status === 'submitting' ? 'Connecting...' : 'Allow'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
