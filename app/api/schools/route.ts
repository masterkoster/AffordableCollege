import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  const schools = await prisma.school.findMany({
    where: type ? { type } : undefined,
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ schools })
}
