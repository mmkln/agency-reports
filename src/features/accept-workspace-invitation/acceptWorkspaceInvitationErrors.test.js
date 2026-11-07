import { describe, expect, it } from 'vitest'

import { getInvitationRecoveryErrorMessage } from './acceptWorkspaceInvitationErrors'

describe('getInvitationRecoveryErrorMessage', () => {
  it('maps backend invitation codes to human-readable copy', () => {
    expect(getInvitationRecoveryErrorMessage(
      { payload: { code: 'INVITATION_CODE_INVALID' } },
      'Fallback message.',
    )).toBe('The code is incorrect. Check the email and try again.')

    expect(getInvitationRecoveryErrorMessage(
      { payload: { code: 'INVITATION_ALREADY_ACCEPTED' } },
      'Fallback message.',
    )).toBe('This invitation was already accepted. Sign in to continue.')
  })

  it('uses caller fallback for transport errors without semantic codes', () => {
    expect(getInvitationRecoveryErrorMessage(
      { message: 'Requested resource was not found.', status: 404 },
      'Invite recovery is not available right now. Use the latest invitation email or try again later.',
    )).toBe('Invite recovery is not available right now. Use the latest invitation email or try again later.')
  })
})
