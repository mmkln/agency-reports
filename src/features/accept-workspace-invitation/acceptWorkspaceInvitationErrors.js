const INVITATION_RECOVERY_ERROR_COPY = {
  INVITATION_ALREADY_ACCEPTED: 'This invitation was already accepted. Sign in to continue.',
  INVITATION_CANCELLED: 'This invitation was cancelled. Ask your agency to send a new invite.',
  INVITATION_CODE_EXPIRED: 'This code expired. Request a new one.',
  INVITATION_CODE_INVALID: 'The code is incorrect. Check the email and try again.',
  INVITATION_EXPIRED: 'This invitation expired. Ask your agency to resend it.',
  INVITATION_NOT_FOUND: 'This invitation is no longer available. Ask your agency to resend it.',
  INVITATION_NO_ACTIVE_INVITATION: 'This invitation is no longer active. Ask your agency to resend it.',
  INVITATION_RECOVERY_EXPIRED: 'This code expired. Request a new one.',
  INVITATION_RECOVERY_NOT_VERIFIED: 'Request a new code before accepting the invitation.',
}

export function getInvitationRecoveryErrorMessage(error, fallback) {
  return INVITATION_RECOVERY_ERROR_COPY[error?.payload?.code] ?? fallback
}
