import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import TransferGuideClient from './TransferGuideClient'

export const dynamic = 'force-dynamic'

interface Course {
  code: string
  name: string
  credits: number
}

type AvailableUniversity = {
  code: string
  name: string
  id: string
}

export default async function TransferGuideDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolId: string; universityId: string; majorId: string }>
  searchParams: Promise<{ compare?: string }>
}) {
  const { schoolId, universityId, majorId } = await params
  const compareUniversityCode = (await searchParams).compare
  
  // Look up schools by code to get IDs
  const originSchool = await prisma.school.findUnique({
    where: { code: schoolId.toUpperCase() },
  })
  const targetSchool = await prisma.school.findUnique({
    where: { code: universityId.toUpperCase() },
  })
  
  // If not found by code, try as UUID
  const originSchoolId = originSchool?.id ?? schoolId
  const targetSchoolId = targetSchool?.id ?? universityId
  
  // Look up major by code or use as UUID
  const major = await prisma.major.findUnique({
    where: { code: majorId.toUpperCase() },
  })
  const majorIdToUse = major?.id ?? majorId
  
  // Fetch all available transfer guides for this origin + major (to know what can be compared)
  const availableGuides = await prisma.transferGuide.findMany({
    where: {
      originSchoolId: originSchoolId,
      majorId: majorIdToUse,
    },
    include: {
      targetSchool: true,
    },
  })
  
  // Get list of available universities to compare (include ID for dropdown)
  const availableUniversities: AvailableUniversity[] = availableGuides
    .filter(g => g.targetSchoolId !== targetSchoolId)
    .map(g => ({
      code: g.targetSchool.code.toLowerCase(),
      name: g.targetSchool.name,
      id: g.targetSchool.code.toLowerCase(), // Use code for simpler URL
    }))
  
  // Fetch the main guide
  const guide = await prisma.transferGuide.findFirst({
    where: {
      originSchoolId: originSchoolId,
      targetSchoolId: targetSchoolId,
      majorId: majorIdToUse,
    },
    include: {
      originSchool: true,
      targetSchool: true,
      major: true,
    },
  })
  
  // Fetch comparison guide if requested
  let compareGuide = null
  if (compareUniversityCode) {
    // Look up the school by code to get the ID
    const compareSchool = await prisma.school.findUnique({
      where: { code: compareUniversityCode.toUpperCase() },
    })
    if (compareSchool) {
      compareGuide = await prisma.transferGuide.findFirst({
        where: {
          originSchoolId: originSchoolId,
          targetSchoolId: compareSchool.id,
          majorId: majorIdToUse,
        },
        include: {
          originSchool: true,
          targetSchool: true,
          major: true,
        },
      })
    }
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
    originSchool: { code: guide.originSchool.code, name: guide.originSchool.name },
    targetSchool: { 
      name: guide.targetSchool.name,
      code: guide.targetSchool.code,
      description: guide.targetSchool.description,
      ranking: guide.targetSchool.ranking,
      totalStudents: guide.targetSchool.totalStudents,
      acceptanceRate: guide.targetSchool.acceptanceRate,
      inStatePerCredit: guide.targetSchool.inStatePerCredit,
    },
    major: { code: guide.major.code, name: guide.major.name },
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

  return <TransferGuideClient guide={guideData} compareGuide={compareGuideData} availableUniversities={availableUniversities} />
}