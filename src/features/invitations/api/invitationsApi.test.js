import { describe, expect, it, vi } from 'vitest'

import {
  acceptInvitationWithEmailCode,
  requestInvitationEmailCode,
  verifyInvitationEmailCode,
} from './invitationsApi'

describe('invitation email code api', () => {
  it('requests an invitation email code', () => {
    const apiClient = { post: vi.fn() }
    const payload = { email: 'client@example.com' }

    requestInvitationEmailCode(apiClient, payload, { skipAuth: true })

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/invitations/email-code/request/',
      payload,
      { skipAuth: true },
    )
  })

  it('verifies an invitation email code', () => {
    const apiClient = { post: vi.fn() }
    const payload = { code: '123456', email: 'client@example.com' }

    verifyInvitationEmailCode(apiClient, payload, { skipAuth: true })

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/invitations/email-code/verify/',
      payload,
      { skipAuth: true },
    )
  })

  it('accepts an invitation with a verified recovery token', () => {
    const apiClient = { post: vi.fn() }
    const payload = {
      invitation_id: 'invitation-id',
      recovery_token: 'recovery-token',
    }

    acceptInvitationWithEmailCode(apiClient, payload, { skipAuth: true })

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/invitations/email-code/accept/',
      payload,
      { skipAuth: true },
    )
  })
})
