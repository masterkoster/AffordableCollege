import { NextRequest, NextResponse } from 'next/server'
import { register, setAuthCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(', ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { email, password, name, role } = parsed.data
    const result = await register(email, password, name, role)

    const response = NextResponse.json({ user: result.user })
    return setAuthCookie(response, result.token)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
