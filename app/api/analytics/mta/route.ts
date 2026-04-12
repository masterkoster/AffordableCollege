import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get leads grouped by origin school
  const leads = await prisma.lead.findMany({
    include: {
      guide: {
        include: {
          originSchool: true,
        },
      },
    },
  })

  // Group by school
  const schoolMap = new Map<string, { totalLeads: number; mtaReady: number; enrolled: number }>()

  leads.forEach((lead) => {
    const schoolCode = lead.guide.originSchool.code
    const schoolName = lead.guide.originSchool.name
    
    if (!schoolMap.has(schoolCode)) {
      schoolMap.set(schoolCode, { totalLeads: 0, mtaReady: 0, enrolled: 0 })
    }
    
    const stats = schoolMap.get(schoolCode)!
    stats.totalLeads++
    
    // MTA-Ready: GPA >= 2.8
    if (lead.gpa && lead.gpa >= 2.8) {
      stats.mtaReady++
    }
    
    // Enrolled: stage is ENROLLED
    if (lead.stage === 'ENROLLED') {
      stats.enrolled++
    }
  })

  const stats = Array.from(schoolMap.entries()).map(([code, data]) => ({
    schoolCode: code,
    schoolName: leads.find(l => l.guide.originSchool.code === code)?.guide.originSchool.name || code,
    ...data,
  }))

  return NextResponse.json({ stats })
}
