import { useMemo, useState } from 'react'

import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../../entities/dashboard-link'
import { VISIBILITY } from '../../../entities/update'

function createInitialForm({ clientId = '', dashboardLink = null } = {}) {
  return {
    clientId: dashboardLink?.clientId ?? dashboardLink?.client_id ?? clientId,
    description: dashboardLink?.description ?? '',
    displayOrder: String(dashboardLink?.displayOrder ?? dashboardLink?.display_order ?? 0),
    embedUrl: dashboardLink?.embedUrl ?? dashboardLink?.embed_url ?? '',
    fallbackMessage: dashboardLink?.fallbackMessage ?? dashboardLink?.fallback_message ?? '',
    id: dashboardLink?.id ?? '',
    name: dashboardLink?.name ?? 'Marketing Performance Dashboard',
    provider: dashboardLink?.provider ?? DASHBOARD_PROVIDERS.LOOKER_STUDIO,
    publicUrl: dashboardLink?.publicUrl ?? dashboardLink?.public_url ?? '',
    showOnOverview: Boolean(dashboardLink?.showOnOverview ?? dashboardLink?.show_on_overview ?? true),
    status: dashboardLink?.status ?? DASHBOARD_LINK_STATUSES.DRAFT,
    visibility: dashboardLink?.visibility ?? VISIBILITY.CLIENT_VISIBLE,
  }
}

export function useDashboardLinkForm({ clientId, dashboardLink, onSubmit }) {
  const initialForm = useMemo(() => createInitialForm({ clientId, dashboardLink }), [clientId, dashboardLink])
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)

  function updateField(fieldName, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    return Promise.resolve(onSubmit(form))
      .catch((caughtError) => {
        setError(caughtError.message)
      })
  }

  return {
    error,
    form,
    handleSubmit,
    updateField,
  }
}
