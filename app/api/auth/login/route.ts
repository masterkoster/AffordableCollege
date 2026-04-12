import { NextRequest, NextResponse } from 'next/server'
import { login, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(', ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { email, password } = parsed.data
    const result = await login(email, password)

    const response = NextResponse.json({ user: result.user })
    return setAuthCookie(response, result.token)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
