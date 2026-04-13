import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FindTransferForm } from './FindTransferForm'

export const dynamic = 'force-dynamic'

type GuideOption = {
  majorId: string
  majorName: string
  originSchoolId: string
  originSchoolName: string
  targetSchoolId: string
  targetSchoolName: string
}

export default async function FindTransferPage() {
  const guides = await prisma.transferGuide.findMany({
    include: {
      originSchool: true,
      targetSchool: true,
      major: true,
    },
  })

  const guideOptions: GuideOption[] = guides.map((g) => ({
    majorId: g.majorId,
    majorName: g.major.name,
    originSchoolId: g.originSchoolId,
    originSchoolName: g.originSchool.name,
    targetSchoolId: g.targetSchoolId,
    targetSchoolName: g.targetSchool.name,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span className="text-xl font-bold text-slate-900">AffordableCollege</span>
          </Link>
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
            Log In
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Find Your Transfer Guide</h1>
          <p className="text-slate-500">Select your major, current school, and target university.</p>
        </div>

        <div className="card p-8">
          <FindTransferForm guides={guideOptions} />
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Do not see your school? <Link href="/login" className="text-blue-600 hover:underline">Contact admissions</Link>
        </p>
      </main>
    </div>
  )
}
