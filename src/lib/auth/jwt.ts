interface JwtPayload {
  exp?: number
  sub?: string
  [claim: string]: unknown
}

/** Decodes (does NOT verify) a JWT payload. Used only to read `exp` for client-side session handling. */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    const bytes = Uint8Array.from(json, (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload
  } catch {
    return null
  }
}

/** Expiry as epoch milliseconds, or null when the token has no readable `exp`. */
export function getTokenExpiry(token: string): number | null {
  const exp = decodeJwt(token)?.exp
  return typeof exp === 'number' ? exp * 1000 : null
}
