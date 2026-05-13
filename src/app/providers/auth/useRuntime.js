import { useAuth } from './useAuth'

export function useRuntime() {
  const { runtime } = useAuth()
  return runtime
}
