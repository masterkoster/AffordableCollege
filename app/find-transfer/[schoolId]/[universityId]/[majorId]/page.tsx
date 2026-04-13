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
  searchParams,
}: {
  params: Promise<{ schoolId: string; universityId: string; majorId: string }>
  searchParams: Promise<{ compare?: string }>
}) {
  const { schoolId, universityId, majorId } = await params
  const compareUniversityId = (await searchParams).compare
  
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

  // Fetch comparison guide if requested
  let compareGuide = null
  if (compareUniversityId) {
    compareGuide = await prisma.transferGuide.findFirst({
      where: {
        originSchoolId: schoolId,
        targetSchoolId: compareUniversityId,
        majorId: majorId,
      },
      include: {
        originSchool: true,
        targetSchool: true,
        major: true,
      },
    })
  }

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
  const compareCourses = compareGuide ? JSON.parse(compareGuide.courses || '[]') as Course[] : []

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

  // Transform comparison guide if exists
  const compareGuideData = compareGuide ? {
    id: compareGuide.id,
    requirements: compareGuide.requirements,
    autoAdmitGPA: compareGuide.autoAdmitGPA,
    programDescription: compareGuide.programDescription,
    degreeType: compareGuide.degreeType,
    totalCredits: compareGuide.totalCredits,
    catalogUrl: compareGuide.catalogUrl,
    courses: compareCourses,
    targetSchool: { 
      name: compareGuide.targetSchool.name,
      code: compareGuide.targetSchool.code,
      description: compareGuide.targetSchool.description,
      ranking: compareGuide.targetSchool.ranking,
      totalStudents: compareGuide.targetSchool.totalStudents,
      acceptanceRate: compareGuide.targetSchool.acceptanceRate,
      inStatePerCredit: compareGuide.targetSchool.inStatePerCredit,
    },
  } : null

  return <TransferGuideClient guide={guideData} compareGuide={compareGuideData} />
}