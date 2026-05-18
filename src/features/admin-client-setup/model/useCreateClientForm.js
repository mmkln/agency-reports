import { useState } from 'react'

import {
  CLIENT_TYPES,
} from '../../../entities/client'
import {
  createAdminClient,
  getPortalSlugIssue,
  normalizePortalSlug,
} from '../../../domain/services/adminClientService'

const emptyForm = {
  logoFileName: '',
  logoUrl: '',
  name: '',
  portalSlug: '',
  primaryContactEmail: '',
  primaryContactName: '',
  type: CLIENT_TYPES.GENERIC,
}

export function useCreateClientForm({
  idGenerator,
  onCreated,
  repositories,
  viewer,
}) {
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const [lastCreatedClient, setLastCreatedClient] = useState(null)
  const slugIssue = getPortalSlugIssue({
    portalSlug: form.portalSlug,
    repositories,
    viewer,
  })
  const visibleSlugIssue = form.portalSlug ? slugIssue : ''

  function updateField(fieldName, value) {
    setError('')
    setLastCreatedClient(null)

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

    if (!event.currentTarget.reportValidity() || visibleSlugIssue) {
      return
    }

    try {
      const result = createAdminClient({
        idGenerator,
        input: form,
        repositories,
        viewer,
      })

      setForm(emptyForm)
      setIsSlugManuallyEdited(false)
      setLastCreatedClient(result)
      onCreated(result.client)
    } catch (caughtError) {
      setError(caughtError.message)
    }
  }

  return {
    error,
    form,
    handleSubmit,
    lastCreatedClient,
    slugIssue: visibleSlugIssue,
    updateField,
  }
}
