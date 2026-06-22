import { describe, expect, it } from 'vitest'

import { isValidEmail } from './email'

describe('isValidEmail', () => {
  it('accepts common email formats', () => {
    expect(isValidEmail('test@test.com')).toBe(true)
    expect(isValidEmail('first.last+tag@example.co')).toBe(true)
  })

  it('rejects incomplete or malformed domains', () => {
    expect(isValidEmail('gg@gg')).toBe(false)
    expect(isValidEmail('ww@we.d.f.')).toBe(false)
    expect(isValidEmail('ww@we..com')).toBe(false)
    expect(isValidEmail('ww@.we.com')).toBe(false)
    expect(isValidEmail('ww@we.com.')).toBe(false)
    expect(isValidEmail('ww@we.c')).toBe(false)
  })
})
