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

    // Transform the JWT payload to match the User interface
    return {
      id: payload.sub || payload.nameid || '',
      email: payload.email || '',
      roles: payload.roles
        ? typeof payload.roles === 'string'
          ? payload.roles.split(',').map((r: string) => r.trim()).filter(Boolean)
          : Array.isArray(payload.roles)
            ? payload.roles
            : []
        : [],
      ...payload // Keep all original claims
    }
  } catch {
    throw new Error('Invalid token payload')
  }
}