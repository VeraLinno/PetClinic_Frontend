import { describe, it, expect } from 'vitest'
import { decodeToken } from './jwt'

describe('decodeToken', () => {
  it('should decode a valid JWT token', () => {
    // Mock JWT token with payload: { "userId": "123", "roles": ["Owner"] }
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlcyI6WyJPd25lciJdfQ.signature'
    const decoded = decodeToken(token)
    expect(decoded.userId).toBe('123')
    expect(decoded.roles).toEqual(['Owner'])
  })

  it('should handle invalid token gracefully', () => {
    const invalidToken = 'invalid.token.here'
    expect(() => decodeToken(invalidToken)).toThrow()
  })
})