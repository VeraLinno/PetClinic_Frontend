export function decodeToken(token: string): any {
  const parts = token.split('.')
  if (parts.length < 2 || !parts[1]) {
    throw new Error('Invalid token format')
  }

  const base64Url = parts[1]
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

  // JWT payload is base64url without padding; atob expects proper padding.
  while (base64.length % 4 !== 0) {
    base64 += '='
  }

  try {
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)

    const roleClaimKeys = [
      'roles',
      'role',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'
    ]

    const rawRoleClaims = roleClaimKeys.flatMap((key) => {
      const value = payload[key]
      if (Array.isArray(value)) return value
      if (typeof value === 'string') return [value]
      return []
    })

    const normalizedRoles = rawRoleClaims
      .flatMap((role) => (typeof role === 'string' ? role.split(',') : []))
      .map((role) => role.trim())
      .filter(Boolean)

    // Transform the JWT payload to match the User interface
    return {
      ...payload,
      id: payload.sub || payload.nameid || '',
      email: payload.email || '',
      roles: [...new Set(normalizedRoles)]
    }
  } catch {
    throw new Error('Invalid token payload')
  }
}