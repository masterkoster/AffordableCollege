import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const COOKIE_NAME = 'auth-token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Password helpers
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// JWT helpers
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

// User sanitization
type UserRecord = {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date
  updatedAt: Date
  password?: string
  [key: string]: unknown
}

export function sanitizeUser(user: UserRecord) {
  const { password, ...safeUser } = user
  return safeUser
}

// Cookie helpers
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
  return response
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete(COOKIE_NAME)
  return response
}

// Get user from request
export function getAuthUserId(request: NextRequest): string | null {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId ?? null
}

export async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  })
  return user
}

// Auth actions
export async function register(email: string, password: string, name?: string, role: string = 'STUDENT') {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error('Email already registered')
  }

  const hashedPassword = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, role },
  })

  const token = generateToken(user.id)
  return { user: sanitizeUser(user), token }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error('Invalid email or password')
  }

  const valid = await verifyPassword(password, user.password)
  if (!valid) {
    throw new Error('Invalid email or password')
  }

  const token = generateToken(user.id)
  return { user: sanitizeUser(user), token }
}
