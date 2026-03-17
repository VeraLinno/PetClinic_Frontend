import { describe, it, expect } from 'vitest'
import { decodeToken } from './jwt'

describe('decodeToken', () => {
  it('should decode a valid JWT token', () => {
    // Mock JWT token with valid base64url encoded payload
    // Payload: { "userId": "123", "roles": ["Owner"] }
    // Using a properly formatted token with base64url encoding
    // Third part is properly padded base64 for "test"
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlcyI6WyJPd25lciJdfQ.dGVzdA=='
    const decoded = decodeToken(token)
    expect(decoded.userId).toBe('123')
    expect(decoded.roles).toEqual(['Owner'])
  })

  it('should handle invalid token gracefully', () => {
    const invalidToken = 'invalid.token.here'
    expect(() => decodeToken(invalidToken)).toThrow()
  })
})
