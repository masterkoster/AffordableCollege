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
  'ENG': 'Engineering',
  'BUS': 'Business Administration',
  'BIO': 'Biology',
  'NUR': 'Nursing',
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
    
    // Determine major from filename
    let major = ''
    for (const key of Object.keys(MAJORS)) {
      if (filename.includes(key.toLowerCase())) {
        major = key
        break
      }
    }
    
    if (!major) {
      console.log(`Could not determine major from: ${filename}`)
      return null
    }
    
    // Extract courses - look for patterns like "MATH 155" or "CS 100" in the text
    const courses: Array<{ code: string; name: string; credits: number }> = []
    const seen = new Set<string>()
    
    // Pattern for course codes followed by course names
    const coursePattern = /([A-Z]{2,4})\s*(\d{3}[A-Z]?)\s+([A-Za-z][A-Za-z\s,]+?)(?:[\s(]*(?:(\d+)\s*(?:credit|hr|unit)s?|\d+\s*(?:credits?|hrs?)))?/gi
    
    let match
    while ((match = coursePattern.exec(text)) !== null) {
      const prefix = match[1].toUpperCase()
      const number = match[2]
      const name = match[3].replace(/[\d(),]/g, '').trim()
      const credits = match[4] ? parseInt(match[4]) : 3
      
      // Valid course prefixes for transfer guides
      const validPrefixes = ['MATH', 'MTH', 'CS', 'PHY', 'PHYS', 'CHM', 'CHEM', 'BIO', 'BIOL', 
                            'ENG', 'COM', 'SPE', 'COMM', 'ACC', 'ECO', 'BUS', 'MKT', 'MGT', 
                            'STA', 'STAT', 'PSY', 'EGR', 'NUR']
      
      if (validPrefixes.includes(prefix) && name.length > 2 && name.length < 60) {
        const code = `${prefix} ${number}`
        const key = `${code}-${name}`
        
        if (!seen.has(key)) {
          seen.add(key)
          courses.push({ code, name, credits })
        }
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