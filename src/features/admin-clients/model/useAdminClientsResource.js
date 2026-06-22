import { useCallback, useEffect, useState } from 'react'

import { listClients } from '@/features/clients'

import { normalizeAdminClientsPayload } from './adminClientsNormalizers'

export function useAdminClientsResource({ apiClient }) {
  const [clients, setClients] = useState([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('loading')

  const reloadClients = useCallback(() => {
    setError('')
    setStatus('loading')

    return listClients(apiClient)
      .then((payload) => {
        setClients(normalizeAdminClientsPayload(payload))
        setStatus('ready')
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setStatus('error')
      })
  }, [apiClient])

  useEffect(() => {
    let isActive = true

    void Promise.resolve()
      .then(() => {
        if (!isActive) {
          return null
        }

        setError('')
        setStatus('loading')
        return listClients(apiClient)
      })
      .then((payload) => {
        if (!isActive || !payload) {
          return
        }

        setClients(normalizeAdminClientsPayload(payload))
        setStatus('ready')
      })
      .catch((caughtError) => {
        if (!isActive) {
          return
        }

        setError(caughtError.message)
        setStatus('error')
      })

    return () => {
      isActive = false
    }
  }, [apiClient])

  const replaceClient = useCallback((nextClient) => {
    setClients((current) => current.map((client) => (
      client.id === nextClient.id ? nextClient : client
    )))
  }, [])

  return {
    clients,
    error,
    reloadClients,
    replaceClient,
    status,
  }
}
