/**
 * Michigan Transfer Agreement PDF Parser
 * 
 * Extracts course data from Michigan community college transfer guides.
 * These PDFs all have consistent formatting from Oakland University.
 * 
 * Usage:
 *   npx tsx scripts/extract-oakland-courses.ts
 *   
 * Or programmatically:
 *   import { extractCoursesFromPDF } from './scripts/extract-oakland-courses'
 *   const courses = await extractCoursesFromPDF('/path/to/pdf.pdf')
 */

import * as fs from 'fs'
import * as path from 'path'

// College code to name mapping
export const COLLEGES: Record<string, string> = {
  'Macomb': 'Macomb Community College',
  'OCC': 'Oakland Community College', 
  'Schoolcraft': 'Schoolcraft College',
  'HenryFord': 'Henry Ford College',
  'WCCCD': 'Wayne County Community College District',
}

// Major code to name mapping
export const MAJORS: Record<string, string> = {
  'CS': 'Computer Science',
  'ComputerScience': 'Computer Science',
  'ENG': 'Engineering',
  'BUS': 'Business Administration',
  'BUSINESS': 'Business Administration',
  'BIO': 'Biology',
  'NUR': 'Nursing',
}

// Determine major from course content if not in filename
function detectMajorFromCourses(courses: string): string {
  const upper = courses.toUpperCase()
  
  // Business indicators: ACC, ECO, BUS, MKT, MGT
  if (upper.includes('ACC ') || upper.includes('ECO ') || upper.includes('BUS ') || 
      upper.includes('MKT ') || upper.includes('MGT ')) {
    return 'BUS'
  }
  
  // Biology indicators: BIO, BIOL (but not BIT - that's something else)
  const bioMatches = upper.match(/BIO[LY]?\s+\d/) || []
  if (bioMatches.length > 2) {
    return 'BIO'
  }
  
  // Engineering indicators: EGR, PRDE, (no specific prefix but lots of MATH/PHYS/CHEM)
  if (upper.includes('EGR ') || upper.includes('PRDE ')) {
    return 'ENG'
  }
  
  return 'CS' // Default to CS
}

// Fallback course names for common courses
function getCourseName(prefix: string, number: string): string {
  const names: Record<string, Record<string, string>> = {
    'MATH': {
      '1760': 'Calculus I',
      '1770': 'Calculus II',
      '2000': 'Linear Algebra',
      '2200': 'Discrete Structures',
      '2760': 'Calculus III',
      '2770': 'Differential Equations',
      '1554': 'Calculus I',
      '1555': 'Calculus II',
      '2554': 'Multivariable Calculus',
      '2775': 'Introduction to Linear Algebra',
      '150': 'Calculus I',
      '151': 'Calculus II',
      '183': 'Calculus I',
      '184': 'Calculus II',
      '230': 'Linear Algebra',
      '161': 'Calculus I',
      '162': 'Calculus II',
      '263': 'Linear Algebra',
      '160': 'Applied Calculus',
      '110': 'Business Mathematics',
      '1360': 'Finite Mathematics',
      '1465': 'Pre-Calculus',
    },
    'MTH': {
      '161': 'Calculus I',
      '162': 'Calculus II',
      '263': 'Linear Algebra',
      '160': 'Applied Calculus',
      '2775': 'Linear Algebra',
      '1221': 'College Algebra',
      '1222': 'Pre-Calculus',
      '1331': 'Finite Mathematics',
      '1332': 'Math for Elementary Teachers I',
      '1441': 'Applied Calculus',
    },
    'ITCS': {
      '1140': 'Problem Solving & Programming',
      '1170': 'Object-Oriented Programming',
      '2250': 'Data Structures',
      '2530': 'Computer Systems',
      '2590': 'Computer Architecture',
      '1010': 'Introduction to Information Technology',
    },
    'ITOS': {
      '1710': 'Operating Systems',
      '1720': 'Networking Fundamentals',
    },
    'ITNT': {
      '1500': 'Introduction to IT',
      '2130': 'Network+',
    },
    'ITWP': {
      '1100': 'Web Development',
    },
    'ITIA': {
      '1310': 'Intro to Cybersecurity',
      '2800': 'Security+',
    },
    'ENGL': {
      '1181': 'Composition I',
      '1190': 'Composition II',
      '1210': 'Composition I',
      '1220': 'Composition II',
      '101': 'Composition I',
      '102': 'Composition II',
      '131': 'Composition I',
      '132': 'Composition II',
      '1510': 'Composition I',
      '1520': 'Composition II',
      '1350': 'Technical Writing',
      '2200': 'Research Writing',
    },
    'PHYS': {
      '2220': 'Physics I',
      '2230': 'Physics II',
      '101': 'Applied Physics I',
      '102': 'Applied Physics II',
      '201': 'Physics III',
      '211': 'General Physics I',
      '141': 'General Physics I',
      '151': 'Physics I',
      '152': 'Physics II',
      '1610': 'General Physics I',
      '1620': 'General Physics II',
      '2400': 'Physics I',
      '2500': 'Physics II',
    },
    'CHEM': {
      '1170': 'General Chemistry I',
      '1180': 'General Chemistry II',
      '101': 'General Chemistry I',
      '102': 'General Chemistry II',
      '111': 'General Chemistry I',
      '112': 'General Chemistry II',
      '151': 'General Chemistry I',
      '152': 'General Chemistry II',
      '141': 'General Chemistry I',
      '2260': 'Organic Chemistry I',
      '2270': 'Organic Chemistry Lab',
      '2280': 'Organic Chemistry II',
      '2610': 'Organic Chemistry I',
      '2620': 'Organic Chemistry II',
      '2650': 'Organic Chemistry Lab',
    },
    'BIO': {
      '1700': 'General Biology',
      '1530': 'General Biology I',
      '1560': 'General Biology II',
      '1000': 'Biology for Non-Majors',
      '151': 'General Biology I',
      '152': 'General Biology II',
      '111': 'General Biology I',
      '112': 'General Biology II',
      '120': 'General Biology I',
      '121': 'Biology I',
      '122': 'Biology II',
      '210': 'Cell Biology',
      '211': 'Cell Biology',
      '251': 'Genetics',
      '2560': 'Microbiology',
      '2710': 'Ecology',
    },
    'ACC': {
      '101': 'Principles of Accounting I',
      '102': 'Principles of Accounting II',
      '115': 'Financial Accounting',
      '116': 'Managerial Accounting',
      '1810': 'Financial Accounting',
      '1820': 'Managerial Accounting',
      '2000': 'Financial Accounting',
      '2100': 'Managerial Accounting',
      '1080': 'Survey of Accounting',
      '1090': 'Introduction to Accounting',
    },
    'ECO': {
      '201': 'Principles of Economics I',
      '202': 'Principles of Economics II',
      '101': 'Introduction to Economics',
      '102': 'Principles of Economics',
      '1160': 'Principles of Economics',
      '1170': 'Principles of Economics',
      '2110': 'Economics',
      '2610': 'Principles of Economics - Micro',
      '2620': 'Principles of Economics - Macro',
      '2000': 'Principles of Economics - Macro',
      '2010': 'Principles of Economics - Micro',
    },
    'PHYS': {
      '2220': 'Physics I',
      '2230': 'Physics II',
    },
    'AUTO': {
      '2600': 'Technical Elective',
    },
  }
  return names[prefix]?.[number] || `${prefix} ${number}`
}

/**
 * Extract courses from a Michigan transfer guide PDF
 * These PDFs have a consistent table format with course codes in the first column
 */
export async function extractCoursesFromPDF(pdfPath: string): Promise<{
  origin: string
  originName: string
  target: string
  major: string
  majorName: string
  courses: Array<{ code: string; name: string; credits: number }>
} | null> {
  try {
    const pdf = require('pdf-parse')
    const dataBuffer = fs.readFileSync(pdfPath)
    const pdfData = await pdf(dataBuffer)
    const text = pdfData.text
    
    const filename = path.basename(pdfPath).toLowerCase()
    
    // Determine origin college from filename
    let origin = ''
    for (const key of Object.keys(COLLEGES)) {
      if (filename.includes(key.toLowerCase().replace(' ', ''))) {
        origin = key
        break
      }
    }
    
    if (!origin) {
      console.log(`Could not determine college from: ${filename}`)
      return null
    }
    
    // Determine major from filename - check more specific patterns first
    let major = ''
    
    // Check for exact major names first (longer = more specific)
    const majorPatterns: Record<string, string> = {
      'computer': 'CS',
      'business': 'BUS', 
      'biology': 'BIO',
      'nursing': 'NUR',
      'mechanical': 'ENG',
      'electrical': 'ENG',
      'computerengineering': 'ENG',
      'bioengineering': 'ENG',
      'engineering': 'ENG',
    }
    
    const lowerFilename = filename.toLowerCase()
    for (const [pattern, majorCode] of Object.entries(majorPatterns)) {
      if (lowerFilename.includes(pattern)) {
        major = majorCode
        break
      }
    }
    
    // If major not detected from filename, detect from course content
    if (!major) {
      major = detectMajorFromCourses(text)
    }
    
    if (!major) {
      console.log(`Could not determine major from: ${filename}`)
      return null
    }
    
    console.log(`  Detected major: ${MAJORS[major] || major}`)
    
    // Oakland University course codes to EXCLUDE (we want community college equivalents)
    const OU_COURSE_CODES = new Set([
      'MTH 1554', 'MTH 1555', 'MTH 2554', 'MTH 2775', 'MTH 2663',
      'PHY 1510', 'PHY 1520', 'PHY 1010', 'PHY 1020',
      'CHM 1440', 'CHM 1450', 'CHM 2340', 'CHM 2350', 'CHM 2370',
      'BIO 1200', 'BIO 1201', 'BIO 1300', 'BIO 2600', 'BIO 3500',
      'CSI 1420', 'CSI 2320', 'CSI 2300', 'CSI 2470', 'CSI 2460', 'CSI 3450',
      'APM 2555', 'APM 2559', 'APM 2663',
      'EGR 1200', 'EGR 1400',
      'WRT 1060', 'STA 2220', 'ECN 2010', 'ECN 2000', 'ECN 2020',
      'COM 2000', 'COM 2403', 'MIS 1000', 'MGT 3500', 'QMM 2410',
      'ACC 2000', 'ACC 2100', 'MKT 3020', 'FIN 3220', 'ORG 3300', 'ORG 3310',
    ])
    
    // Extract courses - look for patterns like "MATH 1760" (MCC courses) in the text
    const courses: Array<{ code: string; name: string; credits: number }> = []
    const seen = new Set<string>()
    
    // Pattern for community college course codes
    // Match patterns like "MATH 1760" or "ITCS 1140" - 3-4 letters + space + 3-4 digits
    const coursePattern = /\b([A-Z]{3,4})\s+(\d{3,4}[A-Z]?)\b/gi
    
    let match
    while ((match = coursePattern.exec(text)) !== null) {
      const prefix = match[1].toUpperCase()
      const number = match[2]
      const code = `${prefix} ${number}`
      
      // Skip if already seen
      if (seen.has(code)) continue
      
      // Skip Oakland University course codes - we want community college equivalents
      if (OU_COURSE_CODES.has(code)) continue
      
      // Valid community college course prefixes
      const validPrefixes = ['MATH', 'MTH', 'CS', 'ITCS', 'ITOS', 'ITNT', 'ITWP', 'ITIA', 
                           'PHY', 'PHYS', 'CHEM', 'CHM', 'BIO', 'BIOL', 'ENGL', 'ENG',
                           'COM', 'SPE', 'COMM', 'ACC', 'ECO', 'BUS', 'MKT', 'MGT', 
                           'STAT', 'PSY', 'AUTO', 'PRDE', 'SPCH', 'ITCN']
      
      if (validPrefixes.includes(prefix)) {
        seen.add(code)
        courses.push({ 
          code, 
          name: getCourseName(prefix, number),
          credits: 3 
        })
      }
    }
    
    // Sort courses: Math first, then CS, then others alphabetically
    const sortOrder: Record<string, number> = {
      'MATH': 1, 'MTH': 1,
      'CS': 2,
      'PHY': 3, 'PHYS': 3,
      'CHM': 4, 'CHEM': 4,
      'BIO': 5, 'BIOL': 5,
      'ENG': 6,
      'COM': 7, 'SPE': 7, 'COMM': 7,
      'ACC': 8, 'ECO': 8, 'BUS': 8, 'MKT': 8, 'MGT': 8,
      'STA': 9, 'STAT': 9,
      'PSY': 10,
      'EGR': 11,
      'NUR': 12,
    }
    
    courses.sort((a, b) => {
      const prefixA = a.code.split(' ')[0]
      const prefixB = b.code.split(' ')[0]
      const orderA = sortOrder[prefixA] || 99
      const orderB = sortOrder[prefixB] || 99
      if (orderA !== orderB) return orderA - orderB
      return a.code.localeCompare(b.code)
    })
    
    // Limit to ~12 most relevant courses
    const relevantCourses = courses.slice(0, 14)
    
    console.log(`\n✓ ${COLLEGES[origin]} → Oakland University (${MAJORS[major]})`)
    console.log(`  Found ${relevantCourses.length} courses`)
    
    return {
      origin,
      originName: COLLEGES[origin],
      target: 'OU',
      major,
      majorName: MAJORS[major],
      courses: relevantCourses,
    }
  } catch (error) {
    console.error(`Error parsing ${pdfPath}:`, error)
    return null
  }
}

/**
 * Generate seed.ts entry format
 */
export function generateSeedEntry(data: ReturnType<typeof extractCoursesFromPDF>): string {
  if (!data) return ''
  
  const courseStr = data.courses
    .map(c => `{ c: '${c.code}', n: '${c.name.replace(/'/g, "\\'")}', cr: ${c.credits} }`)
    .join(',\n      ')
  
  return `{ o: '${data.origin}', t: '${data.target}', m: '${data.major}', r: 'GPA >= 2.5', a: 2.8, c: [\n      ${courseStr}\n    ] }`
}

/**
 * Process a directory of PDFs
 */
export async function processPDFs(directory: string): Promise<void> {
  if (!fs.existsSync(directory)) {
    console.log(`Directory not found: ${directory}`)
    console.log('\nUsage: npx tsx scripts/extract-oakland-courses.ts <directory>')
    console.log('\nExample: npx tsx scripts/extract-oakland-courses.ts ./transfer-guides')
    return
  }
  
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.pdf'))
  
  console.log(`Found ${files.length} PDF files in ${directory}\n`)
  
  const results: ReturnType<typeof extractCoursesFromPDF>[] = []
  
  for (const file of files) {
    const result = await extractCoursesFromPDF(path.join(directory, file))
    if (result) results.push(result)
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('SEED.TS FORMAT')
  console.log('='.repeat(60) + '\n')
  
  for (const r of results) {
    console.log(generateSeedEntry(r))
    console.log('')
  }
  
  console.log('\nAdd these to the guides array in prisma/seed.ts')
}

// Run if called directly
if (require.main === module) {
  const directory = process.argv[2] || './transfer-guides'
  processPDFs(directory)
    .then(() => console.log('\nDone!'))
    .catch(console.error)
}