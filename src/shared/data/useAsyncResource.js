import { useCallback, useEffect, useRef, useState } from 'react'

import { normalizeResourceError } from './resourceError'

export function useAsyncResource({ dependencyKey = '', initialData = null, load }) {
  const requestIdRef = useRef(0)
  const loadRef = useRef(load)
  const [state, setState] = useState({
    data: initialData,
    error: '',
    errorInfo: null,
    status: 'loading',
  })

  useEffect(() => {
    loadRef.current = load
  }, [load])

  const reload = useCallback(() => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    setState((currentState) => ({
      ...currentState,
      error: '',
      errorInfo: null,
      status: 'loading',
    }))

    return loadRef.current()
      .then((data) => {
        if (requestIdRef.current !== requestId) {
          return data
        }

        setState({
          data,
          error: '',
          errorInfo: null,
          status: 'ready',
        })

        return data
      })
      .catch((error) => {
        if (requestIdRef.current !== requestId) {
          return null
        }

        setState({
          data: null,
          error: error.message,
          errorInfo: normalizeResourceError(error),
          status: 'error',
        })

        return null
      })
  }, [])

  useEffect(() => {
    void Promise.resolve().then(() => reload())
  }, [dependencyKey, reload])

  return {
    ...state,
    reload,
  }
}
