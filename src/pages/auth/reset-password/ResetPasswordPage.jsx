import { ResetPassword } from '@/features/password-reset'

import { useAuth } from '../../../app/providers/auth/useAuth'

export function ResetPasswordPage() {
  const auth = useAuth()

  return <ResetPassword auth={auth} />
}
