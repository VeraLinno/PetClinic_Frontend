import { describe, it, expect } from 'vitest'
import { decodeToken } from './jwt'

describe('decodeToken', () => {
  it('should decode a valid JWT token', () => {
    const payload = { userId: '123', roles: ['Owner'] }
    const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
    const token = `header.${encodedPayload}.signature`

    const decoded = decodeToken(token)
    expect(decoded.userId).toBe('123')
    expect(decoded.roles).toEqual(['Owner'])
  })

  it('should handle invalid token gracefully', () => {
    const invalidToken = 'invalid.token.here'
    expect(() => decodeToken(invalidToken)).toThrow()
  })
})
