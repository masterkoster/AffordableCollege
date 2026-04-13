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

// Comparison guide doesn't need originSchool and major
interface CompareGuideData {
  id: string
  requirements: string
  autoAdmitGPA: number | null
  programDescription: string | null
  degreeType: string | null
  totalCredits: number | null
  catalogUrl: string | null
  courses: Course[]
  targetSchool: { 
    name: string
    code: string
    description: string | null
    ranking: number | null
    totalStudents: number | null
    acceptanceRate: number | null
    inStatePerCredit: number | null
  }
}

export default function TransferGuideClient({ 
  guide,
  compareGuide 
}: { 
  guide: TransferGuideData
  compareGuide?: CompareGuideData | null 
}) {
  const courses = guide.courses
  const router = useRouter()
  
  // Calculate costs and transfer stats
  const calculateStats = (guideData: TransferGuideData | CompareGuideData, originTuition = 135) => {
    const totalCredits = guideData.courses.reduce((sum, c) => sum + c.credits, 0)
    const ccCost = totalCredits * originTuition
    const uniCost = totalCredits * (guideData.targetSchool.inStatePerCredit ?? 500)
    const remainingCredits = (guideData.totalCredits ?? 128) - totalCredits
    const remainingCost = remainingCredits * (guideData.targetSchool.inStatePerCredit ?? 500)
    
    // Time to graduate estimation
    const ccCreditsPerSemester = 15 // typical CC load
    const uniCreditsPerSemester = 15 // typical university load
    const ccSemesters = Math.ceil(totalCredits / ccCreditsPerSemester)
    const uniSemesters = Math.ceil(remainingCredits / uniCreditsPerSemester)
    const totalYears = (ccSemesters + uniSemesters) / 2 // divide by 2 for 2 semesters/year
    
    return { 
      totalCredits, 
      ccCost, 
      uniCost, 
      remainingCredits, 
      remainingCost, 
      totalCost: ccCost + remainingCost,
      ccSemesters,
      uniSemesters,
      totalYears
    }
  }
  
  const primaryStats = calculateStats(guide)
  const compareStats = compareGuide ? calculateStats(compareGuide) : null
  
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

        {/* Comparison Section */}
        {compareGuide && compareStats && (
          <div className="card overflow-hidden mb-6 border-2 border-green-200">
            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
              <h2 className="text-lg font-semibold text-slate-900">University Comparison</h2>
            </div>
            <div className="grid md:grid-cols-2 divide-x divide-green-200">
              {/* Primary University */}
              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">{guide.targetSchool.name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transfer Credits</span>
                    <span className="font-semibold">{primaryStats.totalCredits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">CC Cost (transferred)</span>
                    <span className="font-semibold">${primaryStats.ccCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Remaining at University</span>
                    <span className="font-semibold">{primaryStats.remainingCredits} credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Time to Graduate</span>
                    <span className="font-semibold">{primaryStats.totalYears.toFixed(1)} years</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-3">
                    <span className="font-medium">Est. Total Cost</span>
                    <span className="font-bold text-blue-600">${primaryStats.totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {/* Compare University */}
              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">{compareGuide.targetSchool.name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transfer Credits</span>
                    <span className="font-semibold">{compareStats.totalCredits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">CC Cost (transferred)</span>
                    <span className="font-semibold">${compareStats.ccCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Remaining at University</span>
                    <span className="font-semibold">{compareStats.remainingCredits} credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Time to Graduate</span>
                    <span className="font-semibold">{compareStats.totalYears.toFixed(1)} years</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-3">
                    <span className="font-medium">Est. Total Cost</span>
                    <span className="font-bold text-green-600">${compareStats.totalCost.toLocaleString()}</span>
                  </div>
                </div>
                {compareStats.totalCost < primaryStats.totalCost && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
                    <p className="text-green-700 font-semibold">
                      Save ${(primaryStats.totalCost - compareStats.totalCost).toLocaleString()}!
                    </p>
                  </div>
                )}
              </div>
            </div>
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
  
  // Real course descriptions from Oakland University catalog
  const courseDescriptions: Record<string, { description: string; prerequisites: string }> = {
    // Computer Science Core
    'CSI 1320': { 
      description: 'Introduction to Python programming and Unix operating system. Covers fundamental programming concepts, data types, control structures, functions, and basic data structures with laboratory.', 
      prerequisites: 'No prior programming experience required' 
    },
    'CSI 2300': { 
      description: 'Object-oriented computer programming using Java. Classes, member functions, inheritance, polymorphism, operator overloading, design methodologies, introduction to software engineering, and basic data structures.', 
      prerequisites: 'CSI 1320 or equivalent programming experience' 
    },
    'CSI 2310': { 
      description: 'Data structures using object-oriented programming. Fundamental data structures including stacks, queues, lists and trees covered in detail. Concepts of design, analysis and verification discussed in context of abstract data types. With laboratory.', 
      prerequisites: 'CSI 2300' 
    },
    'CSI 2360': { 
      description: 'Programming in C language. Covers C syntax, pointers, memory management, data structures, and system-level programming.', 
      prerequisites: 'CSI 2300 or high-level programming course' 
    },
    'CSI 2470': { 
      description: 'Introduction to computer networks, protocols, and network programming. Covers TCP/IP, sockets, OSI model, routing, and distributed systems.', 
      prerequisites: 'CSI 2300' 
    },
    'CSI 3370': { 
      description: 'Software engineering principles and practices. Covers requirements engineering, design patterns, testing, agile methodologies, and project management.', 
      prerequisites: 'CSI 2310' 
    },
    'CSI 3430': { 
      description: 'Theory of computation. Covers automata theory, formal languages, Turing machines, computability, and complexity theory.', 
      prerequisites: 'CSI 2310, MTH 1554' 
    },
    'CSI 3450': { 
      description: 'Database design, SQL, and implementation. Covers relational model, ER modeling, normalization, SQL queries, transactions, and query optimization.', 
      prerequisites: 'CSI 2310' 
    },
    'CSI 3480': { 
      description: 'Security principles and practices in computing. Covers encryption, authentication, access control, network security, and secure coding practices.', 
      prerequisites: 'CSI 2470' 
    },
    'CSI 3640': { 
      description: 'Computer organization and architecture. Covers CPU design, memory systems, I/O, instruction sets, and performance analysis.', 
      prerequisites: 'CSI 2300' 
    },
    'CSI 4350': { 
      description: 'Programming languages. Study of language design paradigms, syntax, semantics, and implementation of compilers and interpreters.', 
      prerequisites: 'CSI 3430' 
    },
    'CSI 4500': { 
      description: 'Operating systems. Covers process management, memory management, file systems, concurrency, and virtualization.', 
      prerequisites: 'CSI 3640' 
    },
    
    // Mathematics
    'MTH 1554': { 
      description: 'Introduction to limits, derivatives, and integrals. Topics include differentiation rules, applications of derivatives, and integration techniques.', 
      prerequisites: 'Pre-Calculus or equivalent (MTH 1465)' 
    },
    'MTH 1555': { 
      description: 'Continuation of Calculus I. Includes integration techniques, sequences, series, polar coordinates, and parametric equations.', 
      prerequisites: 'MTH 1554' 
    },
    'MATH 1760': { 
      description: 'Limits, continuity, differentiation, and integration. Applications of derivatives and integrals. Covers foundational calculus concepts.', 
      prerequisites: 'MATH 155 or Pre-Calculus' 
    },
    'MATH 1770': { 
      description: 'Continuation of Calculus I. Advanced integration techniques, sequences, series, and polar coordinates.', 
      prerequisites: 'MATH 1760' 
    },
    'MATH 2000': { 
      description: 'Linear algebra. Covers vectors, matrices, linear transformations, eigenvalues, and eigenvectors.', 
      prerequisites: 'MATH 1760 or MTH 1554' 
    },
    'MATH 2200': { 
      description: 'Discrete mathematics. Covers logic, sets, relations, combinatorics, graph theory, and proof techniques.', 
      prerequisites: 'MTH 1554' 
    },
    'MATH 2760': { 
      description: 'Multivariable calculus. Functions of several variables, partial derivatives, multiple integrals, and vector calculus.', 
      prerequisites: 'MATH 1770 or MTH 1555' 
    },
    
    // Physics
    'PHYS 2220': { 
      description: 'Classical mechanics, thermodynamics, and waves. Includes laboratory experiments and problem-solving.', 
      prerequisites: 'MATH 1760, high school physics' 
    },
    'PHYS 2230': { 
      description: 'Electricity and magnetism. Covers electric fields, magnetic fields, circuits, and electromagnetic waves.', 
      prerequisites: 'PHYS 2220, MATH 1770' 
    },
    'PHYS 231': { 
      description: 'University Physics I. Mechanics, thermodynamics, and waves with calculus-based problem solving.', 
      prerequisites: 'MATH 180 or equivalent' 
    },
    'PHYS 232': { 
      description: 'University Physics II. Electricity, magnetism, and optics with calculus-based problem solving.', 
      prerequisites: 'PHYS 231, MATH 183' 
    },
    
    // Chemistry
    'CHEM 1170': { 
      description: 'General Chemistry I. Atomic structure, bonding, stoichiometry, thermochemistry, and periodic properties.', 
      prerequisites: 'High school chemistry' 
    },
    'CHEM 1180': { 
      description: 'General Chemistry II. Kinetics, equilibrium, acid-base chemistry, electrochemistry, and thermodynamics.', 
      prerequisites: 'CHEM 1170' 
    },
    'CHEM 141': { 
      description: 'General Chemistry I. Atomic structure, periodic trends, chemical bonding, and stoichiometry.', 
      prerequisites: 'High school chemistry' 
    },
    
    // English
    'ENGL 1181': { 
      description: 'College-level composition focusing on academic writing, critical thinking, research skills, and argumentation.', 
      prerequisites: 'Placement test or equivalent' 
    },
    'ENGL 1190': { 
      description: 'Second semester composition. Research writing, critical analysis, and synthesis of multiple sources.', 
      prerequisites: 'ENGL 1181' 
    },
    'ENG 131': { 
      description: 'Introduction to college writing. Focus on composing processes, rhetorical awareness, and critical thinking.', 
      prerequisites: 'Placement test' 
    },
    'ENG 132': { 
      description: 'College writing. Advanced composition, argumentation, and research-based writing.', 
      prerequisites: 'ENG 131' 
    },
    
    // Accounting & Business
    'ACC 1810': { 
      description: 'Introduction to financial accounting. Covers the accounting cycle, financial statements, and analysis.', 
      prerequisites: 'No prerequisites' 
    },
    'ACC 1820': { 
      description: 'Managerial accounting. Covers cost accounting, budgeting, and decision-making tools for managers.', 
      prerequisites: 'ACC 1810' 
    },
    'BAC 131': { 
      description: 'Financial Accounting. Introduction to accounting principles, financial statement preparation, and analysis.', 
      prerequisites: 'No prerequisites' 
    },
    'BAC 132': { 
      description: 'Managerial Accounting. Cost behavior, budgeting, and management decision-making using accounting data.', 
      prerequisites: 'BAC 131' 
    },
    'ECO 2610': { 
      description: 'Principles of Economics - Micro. Analysis of consumer behavior, market structures, and welfare economics.', 
      prerequisites: 'No prerequisites' 
    },
    'ECO 2620': { 
      description: 'Principles of Economics - Macro. Analysis of national income, inflation, unemployment, and fiscal policy.', 
      prerequisites: 'No prerequisites' 
    },
    'BEC 151': { 
      description: 'Principles of Macroeconomics. Introduction to macroeconomic theory, national income, and monetary policy.', 
      prerequisites: 'No prerequisites' 
    },
    'BEC 152': { 
      description: 'Principles of Microeconomics. Analysis of price theory, consumer behavior, and market structures.', 
      prerequisites: 'No prerequisites' 
    },
    
    // Biology
    'BIO 152': { 
      description: 'General Biology II. Continuation of BIO 151. Covers evolution, diversity, ecology, and behavior.', 
      prerequisites: 'BIO 151' 
    },
    'BIO 1530': { 
      description: 'General Biology I. Cell structure, genetics, evolution, and molecular biology with laboratory.', 
      prerequisites: 'High school biology' 
    },
    'BIO 1560': { 
      description: 'General Biology II. Organismal biology, evolution, diversity, and ecology.', 
      prerequisites: 'BIO 1530' 
    },
    'BIO 2100': { 
      description: 'Human Anatomy and Physiology. Structure and function of the human body systems.', 
      prerequisites: 'BIO 1530 or equivalent' 
    },
    
    // IT/Programming
    'ITCS 1140': { 
      description: 'Problem Solving and Programming. Introduction to programming using Python with emphasis on problem-solving.', 
      prerequisites: 'No prior programming experience' 
    },
    'ITCS 1170': { 
      description: 'Object-Oriented Programming. Object-oriented programming using Java, covering classes, inheritance, and design.', 
      prerequisites: 'ITCS 1140 or equivalent' 
    },
    'ITCS 2250': { 
      description: 'Data Structures. Fundamental data structures including arrays, linked lists, trees, and algorithms.', 
      prerequisites: 'ITCS 1170' 
    },
    'ITCS 2530': { 
      description: 'Computer Systems. Introduction to computer architecture, operating systems, and networking.', 
      prerequisites: 'ITCS 1170' 
    },
    'CIS 129': { 
      description: 'Programming I. Introduction to programming with emphasis on problem-solving and algorithm design.', 
      prerequisites: 'No prior programming experience' 
    },
    'CIS 170': { 
      description: 'Programming II. Object-oriented programming with data structures and algorithm analysis.', 
      prerequisites: 'CIS 129 or equivalent' 
    },
  }
  
  const info = courseDescriptions[course.code] || { 
    description: `This course covers topics related to ${course.name}. Course content may vary based on specific program requirements and instructor.`,
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