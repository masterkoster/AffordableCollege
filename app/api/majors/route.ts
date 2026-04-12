import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const majors = await prisma.major.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ majors })
}
