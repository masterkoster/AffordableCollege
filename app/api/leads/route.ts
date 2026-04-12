import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await getAuthUser(request as unknown as NextRequest)
  
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const leads = await prisma.lead.findMany({
    include: {
      guide: {
        include: {
          originSchool: true,
          targetSchool: true,
          major: true,
        },
      },
      student: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ leads })
}
