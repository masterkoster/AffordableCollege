import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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
          <Link href="/find-transfer" className="btn-primary">
            Find Another Guide
          </Link>
        </div>
      </div>
    )
  }

  const courses = JSON.parse(guide.courses || '[]') as Course[]

  async function applyToGuide(formData: FormData) {
    'use server'
    const guideId = formData.get('guideId') as string
    redirect('/signup?guideId=' + guideId)
  }

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

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-4">
            Transfer Guide
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {guide.originSchool.name}
          </h1>
          <p className="text-slate-500">
            to {guide.targetSchool.name} — {guide.major.name}
          </p>
        </div>

        {/* University Info Widget */}
        <div className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            {/* University Logo - with fallback to initials */}
            <div className="w-20 h-20 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
              {guide.targetSchool.code ? (
                <img 
                  src={`/logos/${guide.targetSchool.code.toLowerCase()}.png`} 
                  alt={`${guide.targetSchool.name} logo`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span className="text-2xl font-bold text-blue-600">
                  {guide.targetSchool.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                {guide.targetSchool.name}
              </h2>
              {guide.targetSchool.description && (
                <p className="text-sm text-slate-600 mb-3">
                  {guide.targetSchool.description}
                </p>
              )}
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {guide.targetSchool.ranking && (
                  <div className="bg-white/60 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">National Ranking</p>
                    <p className="text-lg font-bold text-slate-900">#{guide.targetSchool.ranking}</p>
                  </div>
                )}
                {guide.targetSchool.totalStudents && (
                  <div className="bg-white/60 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">Students</p>
                    <p className="text-lg font-bold text-slate-900">
                      {guide.targetSchool.totalStudents >= 1000 
                        ? `${(guide.targetSchool.totalStudents / 1000).toFixed(1)}K`
                        : guide.targetSchool.totalStudents}
                    </p>
                  </div>
                )}
                {guide.targetSchool.acceptanceRate && (
                  <div className="bg-white/60 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">Acceptance</p>
                    <p className="text-lg font-bold text-emerald-600">{guide.targetSchool.acceptanceRate}%</p>
                  </div>
                )}
                {guide.targetSchool.inStatePerCredit && (
                  <div className="bg-white/60 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">Per Credit</p>
                    <p className="text-lg font-bold text-blue-600">${Math.round(guide.targetSchool.inStatePerCredit)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Program Details */}
          {guide.programDescription && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {guide.degreeType}
                </span>
                {guide.totalCredits && (
                  <span className="text-xs text-slate-500">
                    {guide.totalCredits} credits
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-2">{guide.programDescription}</p>
              {guide.catalogUrl && (
                <a 
                  href={guide.catalogUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  View Full Program Requirements →
                </a>
              )}
            </div>
          )}
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Requirements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Minimum GPA</p>
              <p className="text-2xl font-bold text-slate-900">
                {guide.requirements.includes('2.5') ? '≥ 2.5' : '≥ 2.0'}
              </p>
            </div>
            {guide.autoAdmitGPA && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Auto-Admit GPA</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ≥ {guide.autoAdmitGPA}
                </p>
                <p className="text-xs text-slate-400">Guarantees admission</p>
              </div>
            )}
          </div>
        </div>

        {guide.pdfUrl && (
          <div className="card p-6 mb-6 bg-blue-50 border-blue-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Official Transfer Guide</h2>
            <p className="text-slate-600 mb-4">
              Download the official PDF from {guide.targetSchool.name}.
            </p>
            <a 
              href={guide.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              Download PDF
            </a>
          </div>
        )}

        <div className="card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">Required Courses</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Course Name</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm font-medium text-slate-900">{course.code}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{course.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-600 text-right">{course.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Ready to Transfer?</h2>
          <form action={applyToGuide}>
            <input type="hidden" name="guideId" value={guide.id} />
            <button type="submit" className="btn-primary py-3 px-6">
              Apply Through This Guide
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          <Link href="/find-transfer" className="hover:text-slate-600">
            ← Find Another Transfer Guide
          </Link>
        </p>
      </main>
    </div>
  )
}