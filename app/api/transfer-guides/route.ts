import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const originSchoolId = searchParams.get('originSchoolId')
  const targetSchoolId = searchParams.get('targetSchoolId')
  const majorId = searchParams.get('majorId')

  const where: Record<string, string> = {}

  if (originSchoolId) where.originSchoolId = originSchoolId
  if (targetSchoolId) where.targetSchoolId = targetSchoolId
  if (majorId) where.majorId = majorId

  const guides = await prisma.transferGuide.findMany({
    where,
    include: {
      originSchool: true,
      targetSchool: true,
      major: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Parse courses JSON for each guide
  const guidesWithCourses = guides.map((guide) => ({
    ...guide,
    courses: JSON.parse(guide.courses || '[]'),
  }))

  return NextResponse.json({ guides: guidesWithCourses })
}