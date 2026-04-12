import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { createLeadSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createLeadSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(', ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { guideId, studentName, studentEmail, studentPhone, gpa, currentSchoolId } = parsed.data

    const lead = await prisma.lead.create({
      data: {
        studentId: user.id,
        guideId,
        studentName,
        studentEmail,
        studentPhone,
        gpa,
        currentSchoolId,
        stage: 'NEW_LEAD',
      },
    })

    return NextResponse.json({ lead })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to apply'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
