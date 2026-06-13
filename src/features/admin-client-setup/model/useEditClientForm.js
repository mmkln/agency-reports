import { useState } from 'react'

import {
  getPortalSlugIssueFromClients,
  normalizePortalSlug,
  updateAdminClient,
} from '../../../domain/services/adminClientService'

function clientToForm(client) {
  return {
    logoFileName: '',
    logoUrl: client?.logo_url ?? '',
    name: client?.name ?? '',
    portalSlug: client?.portal_slug ?? '',
    primaryContactEmail: client?.primary_contact_email ?? '',
    primaryContactName: client?.primary_contact_name ?? '',
    status: client?.status ?? '',
  }
}

export function useEditClientForm({
  client,
  dataClient,
  existingClients = [],
  onUpdated,
  viewer,
}) {
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => clientToForm(client))
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const slugIssue = getPortalSlugIssueFromClients({
    clients: existingClients,
    ignoreClientId: client?.id,
    portalSlug: form.portalSlug,
    viewer,
  })
  const visibleSlugIssue = form.portalSlug ? slugIssue : ''

  function updateField(fieldName, value) {
    setError('')

    if (fieldName === 'name') {
      setForm((currentForm) => ({
        ...currentForm,
        name: value,
        portalSlug: isSlugManuallyEdited ? currentForm.portalSlug : normalizePortalSlug(value),
      }))
      return
    }

    if (fieldName === 'portalSlug') {
      setIsSlugManuallyEdited(true)
      setForm((currentForm) => ({
        ...currentForm,
        portalSlug: normalizePortalSlug(value),
      }))
      return
    }

    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: typeof value === 'string' ? value.trimStart() : value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!client || !event.currentTarget.reportValidity() || visibleSlugIssue) {
      return
    }

    void dataClient.write((repositories) => updateAdminClient({
      clientId: client.id,
      input: form,
      repositories,
      viewer,
    }))
      .then((updatedClient) => {
        onUpdated(updatedClient)
      })
      .catch((caughtError) => {
        setError(caughtError.message)
      })
  }

  return {
    error,
    form,
    handleSubmit,
    slugIssue: visibleSlugIssue,
    updateField,
  }
}
