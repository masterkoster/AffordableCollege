'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'

interface Course {
  code: string
  name: string
  credits: number
}

interface TransferGuideData {
  id: string
  requirements: string
  autoAdmitGPA: number | null
  programDescription: string | null
  degreeType: string | null
  totalCredits: number | null
  catalogUrl: string | null
  courses: Course[]
  originSchool: { name: string }
  targetSchool: { 
    name: string
    code: string
    description: string | null
    ranking: number | null
    totalStudents: number | null
    acceptanceRate: number | null
    inStatePerCredit: number | null
  }
  major: { name: string }
}

export default function TransferGuideClient({ guide }: { guide: TransferGuideData }) {
  const courses = guide.courses
  const router = useRouter()
  
  const handleApply = () => {
    router.push('/signup?guideId=' + guide.id)
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
            <div className="w-20 h-20 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden p-2">
              <img 
                src={`/logos/${guide.targetSchool.code.toLowerCase()}.svg`} 
                alt={`${guide.targetSchool.name} logo`}
                className="max-w-full max-h-full object-contain"
              />
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
                <CourseRow key={idx} course={course} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Ready to Transfer?</h2>
          <button onClick={handleApply} className="btn-primary py-3 px-6">
            Apply Through This Guide
          </button>
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

// Course popup component
function CourseRow({ course }: { course: Course }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const courseDescriptions: Record<string, { description: string; prerequisites: string }> = {
    'MTH 1554': { description: 'Introduction to limits, derivatives, and integrals. Topics include differentiation rules, applications of derivatives, and integration.', prerequisites: 'Pre-Calculus or equivalent' },
    'MTH 1555': { description: 'Continuation of Calculus I. Includes integration techniques, sequences, series, and polar coordinates.', prerequisites: 'MTH 1554' },
    'CSI 1320': { description: 'Introduction to Python programming and Unix operating system. Covers fundamental programming concepts and tools.', prerequisites: 'No prior programming experience required' },
    'CSI 2300': { description: 'Object-oriented programming using Java. Covers classes, objects, inheritance, polymorphism, and design patterns.', prerequisites: 'CSI 1320 or equivalent programming experience' },
    'CSI 2310': { description: 'Data structures including arrays, linked lists, stacks, queues, trees, and graphs. Algorithm analysis and design.', prerequisites: 'CSI 2300, MTH 1554' },
    'CSI 2470': { description: 'Introduction to computer networks, protocols, and network programming. Covers TCP/IP, sockets, and distributed systems.', prerequisites: 'CSI 2300' },
    'CSI 3370': { description: 'Software engineering principles and practices. Covers requirements, design, testing, and agile methodologies.', prerequisites: 'CSI 2310' },
    'CSI 3450': { description: 'Database design, SQL, and implementation. Covers relational model, normalization, and query optimization.', prerequisites: 'CSI 2310' },
    'CSI 3480': { description: 'Security principles and practices in computing. Covers encryption, authentication, and secure coding.', prerequisites: 'CSI 2470' },
    'MATH 1760': { description: 'Limits, continuity, differentiation, and integration. Applications of derivatives and integrals.', prerequisites: 'MATH 155 or Pre-Calculus' },
    'PHYS 2220': { description: 'Classical mechanics, thermodynamics, and waves. Includes laboratory experiments.', prerequisites: 'MATH 1760, high school physics' },
    'ENGL 1181': { description: 'College-level composition focusing on academic writing, critical thinking, and research skills.', prerequisites: 'Placement test or equivalent' },
    'ACC 1810': { description: 'Introduction to financial accounting. Covers the accounting cycle, financial statements, and analysis.', prerequisites: 'No prerequisites' },
    'ECO 2610': { description: 'Microeconomic analysis of consumer behavior, market structures, and welfare economics.', prerequisites: 'No prerequisites' },
  }
  
  const info = courseDescriptions[course.code] || { 
    description: `This course covers topics related to ${course.name}. Specific content may vary based on curriculum.`,
    prerequisites: 'Check with academic advisor for specific prerequisites.'
  }
  
  return (
    <>
      <tr 
        className="hover:bg-slate-50 cursor-pointer" 
        onClick={() => setIsOpen(true)}
      >
        <td className="px-6 py-3 text-sm font-medium text-blue-600">{course.code}</td>
        <td className="px-6 py-3 text-sm text-slate-600">{course.name}</td>
        <td className="px-6 py-3 text-sm text-slate-600 text-right">{course.credits}</td>
      </tr>
      
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-full max-w-md z-50 shadow-xl">
            <Dialog.Title className="text-xl font-bold text-slate-900 mb-2">
              {course.code}: {course.name}
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Description</h4>
                <p className="text-sm text-slate-600">{info.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Credits</h4>
                <p className="text-sm text-slate-600">{course.credits} credit hours</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Prerequisites</h4>
                <p className="text-sm text-slate-600">{info.prerequisites}</p>
              </div>
            </div>
            <Dialog.Close className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl">
              ✕
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}