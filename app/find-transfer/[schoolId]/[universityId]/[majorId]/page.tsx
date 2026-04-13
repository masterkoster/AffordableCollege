import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import TransferGuideClient from './TransferGuideClient'

export const dynamic = 'force-dynamic'

interface Course {
  code: string
  name: string
  credits: number
}

export default async function TransferGuideDetailPage({
  params,
}: {
  params: Promise<{ schoolId: string; universityId: string; majorId: string }>
}) {
  const { schoolId, universityId, majorId } = await params
  
  const guide = await prisma.transferGuide.findFirst({
    where: {
      originSchoolId: schoolId,
      targetSchoolId: universityId,
      majorId: majorId,
    },
    include: {
      originSchool: true,
      targetSchool: true,
      major: true,
    },
  })

  if (!guide) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">No Transfer Guide Found</h1>
          <p className="text-slate-500 mb-6">
            There is no transfer agreement for this combination.
          </p>
          <a href="/find-transfer" className="btn-primary">
            Find Another Guide
          </a>
        </div>
      </div>
    )
  }

  const courses = JSON.parse(guide.courses || '[]') as Course[]

  // Transform for client component
  const guideData = {
    id: guide.id,
    requirements: guide.requirements,
    autoAdmitGPA: guide.autoAdmitGPA,
    programDescription: guide.programDescription,
    degreeType: guide.degreeType,
    totalCredits: guide.totalCredits,
    catalogUrl: guide.catalogUrl,
    courses,
    originSchool: { name: guide.originSchool.name },
    targetSchool: { 
      name: guide.targetSchool.name,
      code: guide.targetSchool.code,
      description: guide.targetSchool.description,
      ranking: guide.targetSchool.ranking,
      totalStudents: guide.targetSchool.totalStudents,
      acceptanceRate: guide.targetSchool.acceptanceRate,
      inStatePerCredit: guide.targetSchool.inStatePerCredit,
    },
    major: { name: guide.major.name },
  }

  return <TransferGuideClient guide={guideData} />
}