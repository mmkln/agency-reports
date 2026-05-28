import { BackendApiRequiredPage } from '../../system/backend-api-required/BackendApiRequiredPage'

export function AcceptInvitePage() {
  return (
    <BackendApiRequiredPage
      description="Invitation acceptance must be implemented against the backend account and workspace membership API. The old local invitation workflow has been disabled."
      returnHref="/login"
      returnLabel="Back to sign in"
      title="Invitation API required"
    />
  )
}
