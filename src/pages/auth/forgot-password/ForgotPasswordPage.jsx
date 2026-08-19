import { ForgotPassword } from '@/features/password-reset'

import { useAuth } from '../../../app/providers/auth/useAuth'

export function ForgotPasswordPage() {
  const auth = useAuth()

  return <ForgotPassword auth={auth} />
}
