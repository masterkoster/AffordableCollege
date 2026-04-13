'use client'

import { useState, useMemo } from 'react'
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
  originSchool: { code: string; name: string }
  targetSchool: { 
    name: string
    code: string
    description: string | null
    ranking: number | null
    totalStudents: number | null
    acceptanceRate: number | null
    inStatePerCredit: number | null
  }
  major: { code: string; name: string }
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

type AvailableUniversity = {
  code: string
  name: string
}

// Michigan scholarships (2025-26) - with scholarship names
const scholsDB: Record<string, { name: string; amounts: Record<string, number> }> = {
  'UDM': { name: 'University of Detroit Mercy', amounts: { '4.0': 14000, '3.5': 12000, '3.0': 12000, '2.5': 11000, '2.0': 6000 } },
  'WSU': { name: 'Wayne State', amounts: { '4.0': 6500, '3.5': 6500, '3.0': 4500, '2.5': 2500, '2.0': 0 } },
  'GVSU': { name: 'Grand Valley State', amounts: { '4.0': 4000, '3.5': 4000, '3.0': 2000, '2.5': 0, '2.0': 0 } },
  'OU': { name: 'Oakland University', amounts: { '4.0': 5000, '3.5': 4000, '3.0': 3000, '2.5': 2000, '2.0': 1000 } },
  'EMU': { name: 'Eastern Michigan', amounts: { '4.0': 3500, '3.5': 3000, '3.0': 2500, '2.5': 1500, '2.0': 0 } },
  'WMU': { name: 'Western Michigan', amounts: { '4.0': 4000, '3.5': 3500, '3.0': 2500, '2.5': 1500, '2.0': 0 } },
  'FSU': { name: 'Ferris State', amounts: { '4.0': 3000, '3.5': 2500, '3.0': 2000, '2.5': 1000, '2.0': 0 } },
  'SVSU': { name: 'Saginaw Valley State', amounts: { '4.0': 3500, '3.5': 3000, '3.0': 2500, '2.5': 1500, '2.0': 0 } },
}

// Michigan Achievement Scholarship (state-wide, for MI residents)
const miAchieveSchol = { name: 'Michigan Achievement Scholarship', amount: 5500 }

function getScholWithName(uni: string, gpa: string): { name: string; amount: number } | null {
  const s = scholsDB[uni]
  if (!s) return null
  const g = parseFloat(gpa)
  let amount = 0
  if (g >= 3.5) amount = s.amounts['3.5'] || s.amounts['4.0']
  else if (g >= 3.0) amount = s.amounts['3.0']
  else if (g >= 2.5) amount = s.amounts['2.5']
  else amount = s.amounts['2.0'] || 0
  if (amount > 0) return { name: s.name + ' Transfer Scholarship', amount }
  return null
}
const gpaOpts = [
  { v: '4.0', l: '4.0' }, { v: '3.5', l: '3.5+' }, { v: '3.0', l: '3.0+' },
  { v: '2.5', l: '2.5+' }, { v: '2.0', l: '< 2.5' },
]

// Course equivalency mapping based on Michigan Transfer Network and known agreements
// Key: CC code -> university code -> { equivalent code, equivalent name }
const courseEquivalencies: Record<string, Record<string, { code: string; name: string } | null>> = {
  // Oakland Community College (OCC) equivalencies
  'MAT 1730': {
    'WSU': { code: 'MATH 1710', name: 'Calculus I' },
    'OU': { code: 'MTH 1554', name: 'Calculus I' },
    'EMU': { code: 'MATH 120', name: 'Calculus I' },
    'GVSU': { code: 'MTH 201', name: 'Calculus I' },
  },
  'MAT 1740': {
    'WSU': { code: 'MATH 1720', name: 'Calculus II' },
    'OU': { code: 'MTH 1555', name: 'Calculus II' },
    'EMU': { code: 'MATH 121', name: 'Calculus II' },
    'GVSU': { code: 'MTH 202', name: 'Calculus II' },
  },
  'CIS 1500': {
    'WSU': { code: 'CS 1000', name: 'Introduction to Computers' },
    'OU': { code: 'CSI 1300', name: 'Intro to Computing' },
    'EMU': { code: 'CIS 100', name: 'Intro to IT' },
    'GVSU': { code: 'CIS 101', name: 'Introduction to Computing' },
  },
  'CIS 2252': {
    'WSU': { code: 'CS 2000', name: 'Data Structures' },
    'OU': { code: 'CSI 2310', name: 'Data Structures' },
    'EMU': { code: 'CIS 225', name: 'Data Structures' },
    'GVSU': { code: 'CS 253', name: 'Data Structures' },
  },
  'CIS 2353': {
    'WSU': { code: 'CS 3000', name: 'Algorithms' },
    'OU': { code: 'CSI 3430', name: 'Theory of Computation' },
    'EMU': { code: 'CIS 300', name: 'Algorithms' },
    'GVSU': { code: 'CS 350', name: 'Algorithms' },
  },
  'EGR 1100': {
    'WSU': { code: 'ENG 1020', name: 'Engineer in Society' },
    'OU': { code: 'EGR 1200', name: 'Engineering Fundamentals' },
    'EMU': { code: 'ENGR 100', name: 'Engineering Fundamentals' },
    'GVSU': { code: 'EGR 100', name: 'Engineering Foundations' },
  },
  // Macomb equivalencies
  'MATH 1760': {
    'OU': { code: 'MTH 1554', name: 'Calculus I' },
    'WSU': { code: 'MATH 1710', name: 'Calculus I' },
    'EMU': { code: 'MATH 120', name: 'Calculus I' },
    'GVSU': { code: 'MTH 201', name: 'Calculus I' },
    'WMU': { code: 'MATH 1700', name: 'Calculus I' },
    'FSU': { code: 'MATH 120', name: 'Pre-Calculus' },
    'SVSU': { code: 'MATH 161', name: 'Calculus I' },
  },
  'MATH 1770': {
    'OU': { code: 'MTH 1555', name: 'Calculus II' },
    'WSU': { code: 'MATH 1720', name: 'Calculus II' },
    'EMU': { code: 'MATH 121', name: 'Calculus II' },
    'GVSU': { code: 'MTH 202', name: 'Calculus II' },
    'WMU': { code: 'MATH 1710', name: 'Calculus II' },
    'FSU': { code: 'MATH 130', name: 'Calculus I' },
    'SVSU': { code: 'MATH 162', name: 'Calculus II' },
  },
  'ITCS 1140': {
    'OU': { code: 'CSI 1320', name: 'Problem Solving with Python' },
    'WSU': { code: 'CS 1020', name: 'Intro to Programming' },
    'EMU': { code: 'CIS 111', name: 'SQL for Database' },
    'GVSU': { code: 'CIS 241', name: 'Systems Programming I' },
  },
  'ITCS 1170': {
    'OU': { code: 'CSI 2300', name: 'Object-Oriented Programming' },
    'WSU': { code: 'CS 2000', name: 'Data Structures' },
    'EMU': { code: 'CIS 125', name: 'Principles of Programming' },
    'GVSU': { code: 'CIS 251', name: 'Systems Programming II' },
  },
  'ITCS 2250': {
    'OU': { code: 'CSI 2310', name: 'Data Structures' },
    'WSU': { code: 'CS 2500', name: 'Algorithms' },
    'EMU': { code: 'CIS 225', name: 'Data Structures' },
    'GVSU': { code: 'CS 253', name: 'Data Structures' },
  },
  'ITCS 2530': {
    'OU': { code: 'CSI 2470', name: 'Computer Networks' },
    'WSU': { code: 'CS 2810', name: 'Computer Organization' },
    'EMU': { code: 'CIS 240', name: 'Computer Architecture' },
    'GVSU': { code: 'CS 351', name: 'Computer Systems' },
  },
  'MATH 2200': {
    'OU': { code: 'MTH 2775', name: 'Discrete Mathematics' },
    'WSU': { code: 'MATH 2200', name: 'Discrete Math' },
    'EMU': { code: 'MATH 220', name: 'Discrete Structures' },
    'GVSU': { code: 'MTH 225', name: 'Discrete Structures' },
  },
  'PHYS 2220': {
    'OU': { code: 'PHY 1510', name: 'Physics I' },
    'WSU': { code: 'PHY 2130', name: 'Physics I' },
    'EMU': { code: 'PHYS 240', name: 'General Physics I' },
    'GVSU': { code: 'PHY 230', name: 'General Physics I' },
  },
  // Henry Ford equivalencies
  'MATH 180': {
    'OU': { code: 'MTH 1554', name: 'Calculus I' },
    'WSU': { code: 'MATH 1710', name: 'Calculus I' },
    'EMU': { code: 'MATH 120', name: 'Calculus I' },
    'WMU': { code: 'MATH 1700', name: 'Calculus I' },
  },
  'MATH 183': {
    'OU': { code: 'MTH 1555', name: 'Calculus II' },
    'WSU': { code: 'MATH 1720', name: 'Calculus II' },
    'EMU': { code: 'MATH 121', name: 'Calculus II' },
    'WMU': { code: 'MATH 1710', name: 'Calculus II' },
  },
  'CIS 170': {
    'OU': { code: 'CSI 2300', name: 'Object-Oriented Programming' },
    'WSU': { code: 'CS 2000', name: 'Data Structures' },
    'EMU': { code: 'CIS 125', name: 'Principles of Programming' },
    'WMU': { code: 'CS 116', name: 'Computer Programming I' },
  },
  // Schoolcraft equivalencies
  'MATH 150': {
    'OU': { code: 'MTH 1554', name: 'Calculus I' },
    'WSU': { code: 'MATH 1710', name: 'Calculus I' },
  },
  'MATH 151': {
    'OU': { code: 'MTH 1555', name: 'Calculus II' },
    'WSU': { code: 'MATH 1720', name: 'Calculus II' },
  },
  'CIS 120': {
    'OU': { code: 'CSI 1300', name: 'Intro to Computing' },
    'WSU': { code: 'CS 1000', name: 'Introduction to Computers' },
  },
  // Common general education courses that typically transfer
  'ENG 131': { 'OU': { code: 'ENG 1010', name: 'Composition I' }, 'WSU': { code: 'ENG 1020', name: 'Intro to College Writing' }, 'EMU': { code: 'ENG 101', name: 'College Writing I' }, 'GVSU': { code: 'WRT 150', name: 'Strategies in Writing' } },
  'ENG 132': { 'OU': { code: 'ENG 1020', name: 'Composition II' }, 'WSU': { code: 'ENG 1030', name: 'College Writing II' }, 'EMU': { code: 'ENG 102', name: 'College Writing II' }, 'GVSU': { code: 'WRT 150', name: 'Strategies in Writing' } },
  'ENGL 1181': { 'OU': { code: 'ENG 1010', name: 'Composition I' }, 'WSU': { code: 'ENG 1020', name: 'Intro to College Writing' } },
  'ENGL 1190': { 'OU': { code: 'ENG 1020', name: 'Composition II' }, 'WSU': { code: 'ENG 1030', name: 'College Writing II' } },
}

// Comprehensive MTA (Michigan Transfer Agreement) general education equivalencies
// These are common gen ed courses that transfer to any Michigan university
const mtaEquivalencies: Record<string, Record<string, { code: string; name: string }>> = {
  // Oakland Community College (OCC)
  'OCC': {
    'ENG 1010': { code: 'ENG 1010', name: 'Composition I' },
    'ENG 1020': { code: 'ENG 1020', name: 'Composition II' },
    'COM 1010': { code: 'COM 1100', name: 'Public Speaking' },
    'COM 1020': { code: 'COM 2400', name: 'Interpersonal Communication' },
    'MAT 1580': { code: 'MTH 1554', name: 'Calculus I' },
    'MAT 1590': { code: 'MTH 1555', name: 'Calculus II' },
    'STA 2220': { code: 'STA 1020', name: 'Elementary Statistics' },
    'BIO 1000': { code: 'BIO 1000', name: 'General Biology' },
    'BIO 1010': { code: 'BIO 1011', name: 'General Biology Lab' },
    'CHEM 1010': { code: 'CHEM 1010', name: 'General Chemistry I' },
    'CHEM 1020': { code: 'CHEM 1020', name: 'General Chemistry II' },
    'PHY 1010': { code: 'PHY 1010', name: 'General Physics I' },
    'PHY 1020': { code: 'PHY 1020', name: 'General Physics II' },
    'ECO 2010': { code: 'ECO 2010', name: 'Principles of Economics I' },
    'ECO 2020': { code: 'ECO 2020', name: 'Principles of Economics II' },
    'PSY 1010': { code: 'PSY 1010', name: 'Introduction to Psychology' },
    'SOC 1010': { code: 'SOC 1010', name: 'Introduction to Sociology' },
    'ART 1010': { code: 'ART 1010', name: 'Art Appreciation' },
    'MUS 1010': { code: 'MUS 1010', name: 'Music Appreciation' },
    'PHL 1010': { code: 'PHL 1010', name: 'Introduction to Philosophy' },
    'HIST 1010': { code: 'HIST 1010', name: 'World History I' },
    'HIST 1020': { code: 'HIST 1020', name: 'World History II' },
  },
  // Macomb Community College
  'Macomb': {
    'ENGL 1181': { code: 'ENG 1020', name: 'Intro to College Writing' },
    'ENGL 1190': { code: 'ENG 1030', name: 'College Writing II' },
    'SPCH 1060': { code: 'COM 1100', name: 'Public Speaking' },
    'SPCH 1200': { code: 'COM 2400', name: 'Interpersonal Communication' },
    'MATH 1340': { code: 'STA 1020', name: 'Statistics' },
    'MATH 1465': { code: 'MTH 1554', name: 'Pre-Calculus' },
    'MATH 1760': { code: 'MTH 1554', name: 'Calculus I' },
    'MATH 1770': { code: 'MTH 1555', name: 'Calculus II' },
    'BIOL 1000': { code: 'BIO 1000', name: 'General Biology' },
    'CHEM 1170': { code: 'CHEM 1010', name: 'General Chemistry I' },
    'CHEM 1180': { code: 'CHEM 1020', name: 'General Chemistry II' },
    'PHYS 2220': { code: 'PHY 1010', name: 'Physics I' },
    'PHYS 2230': { code: 'PHY 1020', name: 'Physics II' },
    'ECON 201': { code: 'ECO 2010', name: 'Principles of Economics I' },
    'ECON 202': { code: 'ECO 2020', name: 'Principles of Economics II' },
    'PSY 101': { code: 'PSY 1010', name: 'Introduction to Psychology' },
    'SOC 101': { code: 'SOC 1010', name: 'Introduction to Sociology' },
    'ART 101': { code: 'ART 1010', name: 'Art Appreciation' },
    'MUS 101': { code: 'MUS 1010', name: 'Music Appreciation' },
    'PHIL 101': { code: 'PHL 1010', name: 'Introduction to Philosophy' },
  },
  // Schoolcraft College
  'Schoolcraft': {
    'ENG 101': { code: 'ENG 1010', name: 'Composition I' },
    'ENG 102': { code: 'ENG 1020', name: 'Composition II' },
    'SPE 101': { code: 'COM 1100', name: 'Public Speaking' },
    'MTH 151': { code: 'MTH 1554', name: 'Calculus I' },
    'MTH 152': { code: 'MTH 1555', name: 'Calculus II' },
    'STA 101': { code: 'STA 1020', name: 'Statistics' },
    'BIO 101': { code: 'BIO 1000', name: 'General Biology' },
    'CHM 101': { code: 'CHEM 1010', name: 'General Chemistry I' },
    'CHM 102': { code: 'CHEM 1020', name: 'General Chemistry II' },
    'PHY 101': { code: 'PHY 1010', name: 'General Physics I' },
    'PHY 102': { code: 'PHY 1020', name: 'General Physics II' },
    'ECO 201': { code: 'ECO 2010', name: 'Principles of Economics I' },
    'ECO 202': { code: 'ECO 2020', name: 'Principles of Economics II' },
    'PSY 101': { code: 'PSY 1010', name: 'Introduction to Psychology' },
    'SOC 101': { code: 'SOC 1010', name: 'Introduction to Sociology' },
  },
  // Henry Ford College
  'HenryFord': {
    'ENG 131': { code: 'ENG 1010', name: 'Composition I' },
    'ENG 132': { code: 'ENG 1020', name: 'Composition II' },
    'SPC 131': { code: 'COM 1100', name: 'Fundamentals of Speaking' },
    'MATH 141': { code: 'STA 1020', name: 'Statistics' },
    'MATH 165': { code: 'MTH 1554', name: 'Pre-Calculus' },
    'MATH 180': { code: 'MTH 1554', name: 'Calculus I' },
    'MATH 183': { code: 'MTH 1555', name: 'Calculus II' },
    'BIO 131': { code: 'BIO 1000', name: 'General Biology' },
    'CHEM 141': { code: 'CHEM 1010', name: 'General Chemistry I' },
    'CHEM 142': { code: 'CHEM 1020', name: 'General Chemistry II' },
    'PHYS 131': { code: 'PHY 1010', name: 'General Physics I' },
    'PHYS 132': { code: 'PHY 1020', name: 'General Physics II' },
    'ECO 201': { code: 'ECO 2010', name: 'Principles of Economics I' },
    'ECO 202': { code: 'ECO 2020', name: 'Principles of Economics II' },
    'PSY 131': { code: 'PSY 1010', name: 'Introduction to Psychology' },
    'SOC 131': { code: 'SOC 1010', name: 'Introduction to Sociology' },
  },
}

// Get MTA-equivalent course for a CC to a specific university
function getMTAEquivalency(ccCode: string, ccSchool: string, uniCode: string): { code: string; name: string } | null {
  const ccEquivs = mtaEquivalencies[ccSchool]
  if (!ccEquivs) return null
  return ccEquivs[ccCode] || null
}

// Helper to calculate graduation date from start semester and years
function calculateGradDate(startSemester: string, years: number): string {
  const [season, yearStr] = startSemester.split(' ')
  const startYear = parseInt(yearStr)
  const totalSemesters = Math.ceil(years * 2)
  
  let currentSeason = season === 'Fall' ? 'Fall' : 'Spring'
  let currentYear = startYear
  
  for (let i = 0; i < totalSemesters; i++) {
    if (i === totalSemesters - 1) {
      if (currentSeason === 'Fall') {
        return `December ${currentYear}`
      } else {
        return `May ${currentYear}`
      }
    }
    currentSeason = currentSeason === 'Fall' ? 'Spring' : 'Fall'
    if (currentSeason === 'Fall') currentYear++
  }
  return 'N/A'
}

// Get the appropriate origin tuition based on school code
function getOriginTuition(schoolCode: string): number {
  const tuitionMap: Record<string, number> = {
    'OCC': 211,
    'Macomb': 113,
    'Schoolcraft': 250,
    'HenryFord': 135,
  }
  return tuitionMap[schoolCode] || 135
}

// Check if a course transfers to a specific university
function getCourseEquivalency(ccCode: string, universityCode: string): { code: string; name: string } | null {
  // Check if we have mapping for this CC course
  if (courseEquivalencies[ccCode]) {
    return courseEquivalencies[ccCode][universityCode] || null
  }
  return null
}

export default function TransferGuideClient({ 
  guide,
  compareGuide,
  availableUniversities = []
}: { 
  guide: TransferGuideData
  compareGuide?: CompareGuideData | null 
  availableUniversities?: AvailableUniversity[]
}) {
  const courses = guide.courses
  const router = useRouter()
  
  // Start semester state
  const [startSemester, setStartSemester] = useState('Fall 2025')
  
  // Calculate costs and transfer stats - use correct CC tuition
  const originTuition = getOriginTuition(guide.originSchool.code)
  const primaryStats = calculateStats(guide, originTuition)
  const compareStats = compareGuide ? calculateStats(compareGuide, originTuition) : null
  
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
        <div className="text-center mb-6">
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

        {/* Start Semester Selector */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-sm text-slate-600">I plan to start:</span>
          <select 
            value={startSemester} 
            onChange={(e) => setStartSemester(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option>Spring 2025</option>
            <option>Fall 2025</option>
            <option>Spring 2026</option>
            <option>Fall 2026</option>
            <option>Spring 2027</option>
            <option>Fall 2027</option>
          </select>
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
              <div className="mt-3 pt-3 border-t border-blue-100">
                <span className="text-sm font-medium text-slate-700">
                  Graduate by: <span className="text-green-600 font-bold">{calculateGradDate(startSemester, primaryStats.totalYears)}</span>
                </span>
              </div>
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
        {compareGuide && compareStats ? (
          <ComparisonSection 
            guide={guide} 
            compareGuide={compareGuide}
            primaryStats={primaryStats}
            compareStats={compareStats}
            originSchoolName={guide.originSchool.name}
            startSemester={startSemester}
          />
        ) : (
          <ComparisonSelector 
            guide={guide} 
            originSchoolCode={guide.originSchool.code}
            majorCode={guide.major.code}
            availableUniversities={availableUniversities}
          />
        )}

        {/* Course Comparison Section - Only show when comparing */}
        {compareGuide ? (
          <CourseComparison 
            primaryCourses={guide.courses}
            compareCourses={compareGuide.courses}
            primaryUniCode={guide.targetSchool.code}
            compareUniCode={compareGuide.targetSchool.code}
            primaryUniName={guide.targetSchool.name}
            compareUniName={compareGuide.targetSchool.name}
          />
        ) : (
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
        )}

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

// Comparison selector component - shown when no comparison is selected
function ComparisonSelector({ 
  guide, 
  originSchoolCode, 
  majorCode,
  availableUniversities = []
}: { 
  guide: TransferGuideData
  originSchoolCode: string
  majorCode: string 
  availableUniversities?: AvailableUniversity[]
}) {
  const router = useRouter()
  const [selectedCompareCode, setSelectedCompareCode] = useState('')
  
  const handleCompare = () => {
    if (selectedCompareCode) {
      router.push(`/find-transfer/${originSchoolCode}/${selectedCompareCode}/${majorCode}?compare=${guide.targetSchool.code}`)
    }
  }

  // Don't show the comparison section if there are no other universities to compare
  if (availableUniversities.length === 0) {
    return null
  }

  return (
    <div className="card p-6 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Compare Universities</h2>
          <p className="text-sm text-slate-600 mb-4">
            See how {guide.targetSchool.name} compares to other universities
          </p>
          <div className="flex gap-3">
            <select
              value={selectedCompareCode}
              onChange={(e) => setSelectedCompareCode(e.target.value)}
              className="input-field flex-1"
            >
              <option value="">Select university to compare...</option>
              {availableUniversities.map((uni) => (
                <option key={uni.code} value={uni.code}>{uni.name}</option>
              ))}
            </select>
            <button 
              onClick={handleCompare}
              disabled={!selectedCompareCode}
              className="btn-primary whitespace-nowrap"
            >
              Compare
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Comparison section with stats, graph, and per-credit costs
function ComparisonSection({
  guide,
  compareGuide,
  primaryStats,
  compareStats,
  originSchoolName,
  startSemester
}: {
  guide: TransferGuideData
  compareGuide: CompareGuideData
  primaryStats: any
  compareStats: any
  originSchoolName: string
  startSemester: string
}) {
  const [isMI, setIsMI] = useState(true)
  const [gpa, setGPA] = useState('3.0')
  
  // Get scholarship info with names
  const pScholInfo = getScholWithName(guide.targetSchool.code.toUpperCase(), gpa)
  const cScholInfo = getScholWithName(compareGuide.targetSchool.code.toUpperCase(), gpa)
  const pScholAmount = pScholInfo?.amount || 0
  const cScholAmount = cScholInfo?.amount || 0
  
  const miAch = isMI ? miAchieveSchol.amount : 0
  const pNet = Math.max(0, primaryStats.totalCost - pScholAmount - miAch)
  const cNet = Math.max(0, compareStats.totalCost - cScholAmount - miAch)
  const winner = pNet < cNet ? guide.targetSchool.name : cNet < pNet ? compareGuide.targetSchool.name : null
  const saveAmt = winner ? Math.abs(pNet - cNet) : 0
  const maxNet = Math.max(pNet, cNet)
  return (
    <div className="space-y-4 mb-6">
      <div className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
        <h2 className="text-lg font-bold text-slate-900 mb-3">University Comparison</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">MI Resident:</span>
            <button onClick={() => setIsMI(true)} className={`px-2 py-1 text-sm rounded ${isMI ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>Yes</button>
            <button onClick={() => setIsMI(false)} className={`px-2 py-1 text-sm rounded ${!isMI ? 'bg-slate-500 text-white' : 'bg-slate-200'}`}>No</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">GPA:</span>
            <select value={gpa} onChange={(e) => setGPA(e.target.value)} className="text-sm border rounded px-2 py-1">
              {gpaOpts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
        </div>
        
        {/* Scholarships Section - Shows specific scholarships for each school */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Scholarships</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {/* Primary University Scholarships */}
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-sm font-medium text-blue-700 mb-2">{guide.targetSchool.name}</p>
              <div className="space-y-1">
                {pScholInfo && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{pScholInfo.name}</span>
                    <span className="text-green-600 font-medium">-${pScholInfo.amount.toLocaleString()}</span>
                  </div>
                )}
                {isMI && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{miAchieveSchol.name}</span>
                    <span className="text-green-600 font-medium">-${miAchieveSchol.amount.toLocaleString()}</span>
                  </div>
                )}
                {!pScholInfo && !isMI && (
                  <span className="text-xs text-slate-400">No scholarships at this GPA</span>
                )}
                {(pScholAmount + (isMI ? miAch : 0)) > 0 && (
                  <div className="flex justify-between text-xs font-medium pt-1 border-t border-slate-100">
                    <span className="text-slate-700">Total</span>
                    <span className="text-green-600">-${(pScholAmount + (isMI ? miAch : 0)).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Compare University Scholarships */}
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="text-sm font-medium text-green-700 mb-2">{compareGuide.targetSchool.name}</p>
              <div className="space-y-1">
                {cScholInfo && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{cScholInfo.name}</span>
                    <span className="text-green-600 font-medium">-${cScholInfo.amount.toLocaleString()}</span>
                  </div>
                )}
                {isMI && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{miAchieveSchol.name}</span>
                    <span className="text-green-600 font-medium">-${miAchieveSchol.amount.toLocaleString()}</span>
                  </div>
                )}
                {!cScholInfo && !isMI && (
                  <span className="text-xs text-slate-400">No scholarships at this GPA</span>
                )}
                {(cScholAmount + (isMI ? miAch : 0)) > 0 && (
                  <div className="flex justify-between text-xs font-medium pt-1 border-t border-slate-100">
                    <span className="text-slate-700">Total</span>
                    <span className="text-green-600">-${(cScholAmount + (isMI ? miAch : 0)).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Cost Table */}
        <div className="overflow-hidden rounded-lg border border-green-200">
          <table className="w-full text-sm">
            <thead className="bg-green-100">
              <tr>
                <th className="px-3 py-2 text-left"></th>
                <th className="px-3 py-2 text-right text-blue-700">{guide.targetSchool.name}</th>
                <th className="px-3 py-2 text-right text-green-700">{compareGuide.targetSchool.name}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-green-200">
                <td className="px-3 py-2">Est. Tuition</td>
                <td className="px-3 py-2 text-right">${primaryStats.totalCost.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">${compareStats.totalCost.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-green-200 bg-green-50/50">
                <td className="px-3 py-2">Less: Scholarships</td>
                <td className="px-3 py-2 text-right text-green-600">-${(pScholAmount + miAch).toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-green-600">-${(cScholAmount + miAch).toLocaleString()}</td>
              </tr>
              <tr className="border-t border-green-200 bg-green-100 font-bold">
                <td className="px-3 py-2">YOUR NET COST</td>
                <td className="px-3 py-2 text-right text-blue-700 text-lg">${pNet.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-green-700 text-lg">${cNet.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <div className="text-xs text-slate-500 mb-1">Net Cost (after scholarships)</div>
          <div className="flex justify-between text-sm mb-1"><span className="font-medium">{guide.targetSchool.name}</span><span className="font-bold text-blue-600">${pNet.toLocaleString()}</span></div>
          <div className="w-full bg-slate-200 rounded-full h-4 mb-2"><div className="bg-blue-500 h-4 rounded-full" style={{width: maxNet > 0 ? `${(pNet/maxNet)*100}%` : '0%'}} /></div>
          <div className="flex justify-between text-sm mb-1"><span className="font-medium">{compareGuide.targetSchool.name}</span><span className="font-bold text-green-600">${cNet.toLocaleString()}</span></div>
          <div className="w-full bg-slate-200 rounded-full h-4"><div className="bg-green-500 h-4 rounded-full" style={{width: maxNet > 0 ? `${(cNet/maxNet)*100}%` : '0%'}} /></div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm bg-white/60 rounded px-3 py-2">
          <span className="text-slate-600">Grad: {calculateGradDate(startSemester, primaryStats.totalYears)} vs {calculateGradDate(startSemester, compareStats.totalYears)}</span>
          {winner && saveAmt > 0 && <span className="text-green-700 font-bold">💰 Save ${saveAmt.toLocaleString()} at {winner}</span>}
        </div>
      </div>
    </div>
  )
}

// Helper function for calculating stats (needs to be before components)
function calculateStats(guideData: TransferGuideData | CompareGuideData, originTuition: number) {
  const totalCredits = guideData.courses.reduce((sum, c) => sum + c.credits, 0)
  const ccCost = totalCredits * originTuition
  const uniTuition = guideData.targetSchool.inStatePerCredit ?? 500
  const uniCost = totalCredits * uniTuition // What those same CC courses would cost at university
  const remainingCredits = (guideData.totalCredits ?? 128) - totalCredits
  const remainingCost = remainingCredits * uniTuition
  
  // Time to graduate estimation: 16 credits/semester, 2 semesters/year (Fall + Winter = 32/year)
  const creditsPerSemester = 16
  const semestersPerYear = 2
  const ccSemesters = Math.ceil(totalCredits / creditsPerSemester)
  const uniSemesters = Math.ceil(remainingCredits / creditsPerSemester)
  const totalYears = (ccSemesters + uniSemesters) / semestersPerYear
  
  return { 
    totalCredits, 
    ccCost, 
    uniCost,
    uniTuition,
    originTuition,
    remainingCredits, 
    remainingCost, 
    totalCost: ccCost + remainingCost,
    ccSemesters,
    uniSemesters,
    totalYears
  }
}

// Course comparison component - shows side by side with equivalency status
function CourseComparison({
  primaryCourses,
  compareCourses,
  primaryUniCode,
  compareUniCode,
  primaryUniName,
  compareUniName
}: {
  primaryCourses: Course[]
  compareCourses: Course[]
  primaryUniCode: string
  compareUniCode: string
  primaryUniName: string
  compareUniName: string
}) {
  // Get all unique CC course codes
  const allCourseCodes = useMemo(() => {
    const codes = new Set<string>()
    primaryCourses.forEach(c => codes.add(c.code))
    return Array.from(codes)
  }, [primaryCourses])
  
  // Categorize courses
  const { inBoth, primaryOnly, compareOnly } = useMemo(() => {
    const primaryCodes = new Set(primaryCourses.map(c => c.code))
    const compareCodes = new Set(compareCourses.map(c => c.code))
    
    const inBoth: { code: string; name: string; credits: number; primaryEquiv: { code: string; name: string } | null; compareEquiv: { code: string; name: string } | null }[] = []
    const primaryOnly: { code: string; name: string; credits: number; primaryEquiv: { code: string; name: string } | null }[] = []
    const compareOnly: { code: string; name: string; credits: number; compareEquiv: { code: string; name: string } | null }[] = []
    
    // Find courses in primary
    primaryCourses.forEach(course => {
      if (compareCodes.has(course.code)) {
        const primaryEquiv = getCourseEquivalency(course.code, primaryUniCode)
        const compareEquiv = getCourseEquivalency(course.code, compareUniCode)
        inBoth.push({
          code: course.code,
          name: course.name,
          credits: course.credits,
          primaryEquiv,
          compareEquiv
        })
      } else {
        const primaryEquiv = getCourseEquivalency(course.code, primaryUniCode)
        primaryOnly.push({
          code: course.code,
          name: course.name,
          credits: course.credits,
          primaryEquiv
        })
      }
    })
    
    // Find courses only in compare
    compareCourses.forEach(course => {
      if (!primaryCodes.has(course.code)) {
        const compareEquiv = getCourseEquivalency(course.code, compareUniCode)
        compareOnly.push({
          code: course.code,
          name: course.name,
          credits: course.credits,
          compareEquiv
        })
      }
    })
    
    return { inBoth, primaryOnly, compareOnly }
  }, [primaryCourses, compareCourses, primaryUniCode, compareUniCode])
  
  const primaryTotalCredits = primaryCourses.reduce((sum, c) => sum + c.credits, 0)
  const compareTotalCredits = compareCourses.reduce((sum, c) => sum + c.credits, 0)
  const commonCredits = inBoth.reduce((sum, c) => sum + c.credits, 0)
  const primaryOnlyCredits = primaryOnly.reduce((sum, c) => sum + c.credits, 0)
  const compareOnlyCredits = compareOnly.reduce((sum, c) => sum + c.credits, 0)
  
  return (
    <div className="space-y-6 mb-6">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Course Transfer Comparison</h2>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg border text-center">
            <p className="text-xs text-slate-500">Common Courses</p>
            <p className="text-lg font-bold text-green-600">{inBoth.length}</p>
            <p className="text-xs text-slate-400">{commonCredits} credits</p>
          </div>
          <div className="bg-white p-3 rounded-lg border text-center">
            <p className="text-xs text-slate-500">{primaryUniName} Only</p>
            <p className="text-lg font-bold text-blue-600">{primaryOnly.length}</p>
            <p className="text-xs text-slate-400">{primaryOnlyCredits} credits</p>
          </div>
          <div className="bg-white p-3 rounded-lg border text-center">
            <p className="text-xs text-slate-500">{compareUniName} Only</p>
            <p className="text-lg font-bold text-amber-600">{compareOnly.length}</p>
            <p className="text-xs text-slate-400">{compareOnlyCredits} credits</p>
          </div>
          <div className="bg-white p-3 rounded-lg border text-center">
            <p className="text-xs text-slate-500">Total Difference</p>
            <p className="text-lg font-bold text-purple-600">{Math.abs(primaryTotalCredits - compareTotalCredits)}</p>
            <p className="text-xs text-slate-400">credits</p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
            <span className="text-slate-600">Transfers to both</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></span>
            <span className="text-slate-600">Only required for {primaryUniName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></span>
            <span className="text-slate-600">Only required for {compareUniName}</span>
          </div>
        </div>
      </div>
      
      {/* Courses that transfer to both - Green */}
      {inBoth.length > 0 && (
        <div className="card overflow-hidden border-2 border-green-200">
          <div className="px-6 py-3 bg-green-50 border-b border-green-200 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <h3 className="font-semibold text-green-800">Courses Transferring to Both ({inBoth.length} courses, {commonCredits} credits)</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-green-25 border-b border-green-200">
                <th className="px-6 py-2 text-left text-xs font-semibold text-green-700">CC Course</th>
                <th className="px-6 py-2 text-left text-xs font-semibold text-green-700">{primaryUniName} Equivalent</th>
                <th className="px-6 py-2 text-left text-xs font-semibold text-green-700">{compareUniName} Equivalent</th>
                <th className="px-6 py-2 text-right text-xs font-semibold text-green-700">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-100">
              {inBoth.map((course, idx) => (
                <tr key={idx} className="hover:bg-green-25">
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-900">{course.code}</div>
                    <div className="text-sm text-slate-500">{course.name}</div>
                  </td>
                  <td className="px-6 py-3">
                    {course.primaryEquiv ? (
                      <div>
                        <div className="font-medium text-blue-600">{course.primaryEquiv.code}</div>
                        <div className="text-sm text-slate-500">{course.primaryEquiv.name}</div>
                      </div>
                    ) : (
                      <span className="text-amber-600 text-sm">Equivalent course accepted</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {course.compareEquiv ? (
                      <div>
                        <div className="font-medium text-green-600">{course.compareEquiv.code}</div>
                        <div className="text-sm text-slate-500">{course.compareEquiv.name}</div>
                      </div>
                    ) : (
                      <span className="text-amber-600 text-sm">Equivalent course accepted</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-slate-600">{course.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Courses only required for primary university - Blue */}
      {primaryOnly.length > 0 && (
        <div className="card overflow-hidden border-2 border-blue-200">
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <h3 className="font-semibold text-blue-800">Only Required for {primaryUniName} ({primaryOnly.length} courses, {primaryOnlyCredits} credits)</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-blue-25 border-b border-blue-200">
                <th className="px-6 py-2 text-left text-xs font-semibold text-blue-700">CC Course</th>
                <th className="px-6 py-2 text-left text-xs font-semibold text-blue-700">{primaryUniName} Equivalent</th>
                <th className="px-6 py-2 text-right text-xs font-semibold text-blue-700">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {primaryOnly.map((course, idx) => (
                <tr key={idx} className="hover:bg-blue-25">
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-900">{course.code}</div>
                    <div className="text-sm text-slate-500">{course.name}</div>
                  </td>
                  <td className="px-6 py-3">
                    {course.primaryEquiv ? (
                      <div>
                        <div className="font-medium text-blue-600">{course.primaryEquiv.code}</div>
                        <div className="text-sm text-slate-500">{course.primaryEquiv.name}</div>
                      </div>
                    ) : (
                      <span className="text-amber-600 text-sm">Check with advisor</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-slate-600">{course.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Courses only required for compare university - Amber */}
      {compareOnly.length > 0 && (
        <div className="card overflow-hidden border-2 border-amber-200">
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
            <h3 className="font-semibold text-amber-800">Only Required for {compareUniName} ({compareOnly.length} courses, {compareOnlyCredits} credits)</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-amber-25 border-b border-amber-200">
                <th className="px-6 py-2 text-left text-xs font-semibold text-amber-700">CC Course</th>
                <th className="px-6 py-2 text-left text-xs font-semibold text-amber-700">{compareUniName} Equivalent</th>
                <th className="px-6 py-2 text-right text-xs font-semibold text-amber-700">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {compareOnly.map((course, idx) => (
                <tr key={idx} className="hover:bg-amber-25">
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-900">{course.code}</div>
                    <div className="text-sm text-slate-500">{course.name}</div>
                  </td>
                  <td className="px-6 py-3">
                    {course.compareEquiv ? (
                      <div>
                        <div className="font-medium text-green-600">{course.compareEquiv.code}</div>
                        <div className="text-sm text-slate-500">{course.compareEquiv.name}</div>
                      </div>
                    ) : (
                      <span className="text-amber-600 text-sm">Check with advisor</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-slate-600">{course.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Warning if course counts differ significantly */}
      {Math.abs(primaryTotalCredits - compareTotalCredits) > 5 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">
            Note: The total required credits differ by {Math.abs(primaryTotalCredits - compareTotalCredits)} credits. 
            This may affect your time to graduation and total cost.
          </p>
        </div>
      )}
    </div>
  )
}