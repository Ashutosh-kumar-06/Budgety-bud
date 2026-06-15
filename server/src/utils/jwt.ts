import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
)

export async function signJWT(payload: Record<string, unknown>, expiresIn: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function verifyJWT(token: string) {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload
  } catch (error) {
    return null
  }
}
