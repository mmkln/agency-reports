import { describe, expect, it } from 'vitest'

import {
  createPasswordCredential,
  findPasswordCredential,
  validatePasswordPair,
  verifyPasswordCredential,
} from './authCredentialService'

describe('authCredentialService', () => {
  it('does not create or validate local demo password credentials', () => {
    expect(() => validatePasswordPair({ confirmPassword: 'password123', password: 'password123' }))
      .toThrow('Local demo password credentials were removed')
    expect(() => createPasswordCredential({}))
      .toThrow('Local demo password credentials were removed')
    expect(findPasswordCredential()).toBeNull()
    expect(verifyPasswordCredential()).toBe(false)
  })
})
