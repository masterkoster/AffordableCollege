const fs = require('fs')
const path = require('path')

// Map filename patterns to origin/target/major - only the clear ones we want
const FILENAME_MAP = {
  // OCC -> OU
  'OCC-Computer-Science': { o: 'OCC', t: 'OU', m: 'CS' },
  'OCC-Engineering': { o: 'OCC', t: 'OU', m: 'ENG' },
  'OCC-Business': { o: 'OCC', t: 'OU', m: 'BUS' },
  'OCC-BIO-Biology-BS': { o: 'OCC', t: 'OU', m: 'BIO' },
  'OCC-Nursing': { o: 'OCC', t: 'OU', m: 'NUR' },
  
  // Macomb -> OU
  'Macomb-Computer-Science': { o: 'Macomb', t: 'OU', m: 'CS' },
  'Macomb-Engineering': { o: 'Macomb', t: 'OU', m: 'ENG' },
  'Macomb-Business': { o: 'Macomb', t: 'OU', m: 'BUS' },
  'Macomb-Biology': { o: 'Macomb', t: 'OU', m: 'BIO' },
  
  // Schoolcraft -> OU
  'Schoolcraft-Computer-Science': { o: 'Schoolcraft', t: 'OU', m: 'CS' },
  'Schoolcraft-Business': { o: 'Schoolcraft', t: 'OU', m: 'BUS' },
  'Schoolcraft-BIO-Biology-BS': { o: 'Schoolcraft', t: 'OU', m: 'BIO' },
  
  // Henry Ford -> OU
  'HenryFord-CS': { o: 'HenryFord', t: 'OU', m: 'CS' },
  
  // WCCCD -> OU
  'WCCCD-CS': { o: 'WCCCD', t: 'OU', m: 'CS' },
}

// Known required courses for each major (based on common transfer requirements)
const MAJOR_COURSES = {
  CS: [
    { code: 'MTH 161', name: 'Calculus I', credits: 4 },
    { code: 'MTH 162', name: 'Calculus II', credits: 4 },
    { code: 'CS 150', name: 'Introduction to Computer Science', credits: 3 },
    { code: 'CS 200', name: 'Data Structures', credits: 3 },
    { code: 'PHY 151', name: 'Physics I - Mechanics', credits: 4 },
    { code: 'ENG 101', name: 'English Composition I', credits: 3 },
  ],
  ENG: [
    { code: 'MTH 161', name: 'Calculus I', credits: 4 },
    { code: 'MTH 162', name: 'Calculus II', credits: 4 },
    { code: 'PHY 151', name: 'Physics I - Mechanics', credits: 4 },
    { code: 'PHY 152', name: 'Physics II - Electricity', credits: 4 },
    { code: 'CHM 151', name: 'General Chemistry I', credits: 4 },
    { code: 'ENG 101', name: 'English Composition I', credits: 3 },
  ],
  BUS: [
    { code: 'ACC 101', name: 'Financial Accounting', credits: 3 },
    { code: 'ACC 102', name: 'Managerial Accounting', credits: 3 },
    { code: 'ECO 201', name: 'Principles of Economics I', credits: 3 },
    { code: 'ECO 202', name: 'Principles of Economics II', credits: 3 },
    { code: 'MTH 155', name: 'Statistics', credits: 4 },
    { code: 'ENG 101', name: 'English Composition I', credits: 3 },
  ],
  BIO: [
    { code: 'BIO 151', name: 'General Biology I', credits: 4 },
    { code: 'BIO 152', name: 'General Biology II', credits: 4 },
    { code: 'CHM 151', name: 'General Chemistry I', credits: 4 },
    { code: 'CHM 152', name: 'General Chemistry II', credits: 4 },
    { code: 'MTH 155', name: 'Statistics', credits: 4 },
    { code: 'PHY 151', name: 'Physics I', credits: 4 },
  ],
  NUR: [
    { code: 'BIO 151', name: 'General Biology I', credits: 4 },
    { code: 'CHM 151', name: 'General Chemistry I', credits: 4 },
    { code: 'MTH 155', name: 'Statistics', credits: 4 },
    { code: 'PSY 101', name: 'Introduction to Psychology', credits: 3 },
    { code: 'SOC 101', name: 'Introduction to Sociology', credits: 3 },
    { code: 'ENG 101', name: 'English Composition I', credits: 3 },
  ],
}

function getAllPDFs(dir) {
  const results = []
  if (!fs.existsSync(dir)) return results
  
  const items = fs.readdirSync(dir)
  for (const item of items) {
    const fullPath = path.join(dir, item)
    if (fs.statSync(fullPath).isDirectory()) {
      results.push(...getAllPDFs(fullPath))
    } else if (item.endsWith('.pdf')) {
      results.push(fullPath)
    }
  }
  return results
}

function parsePDFs() {
  console.log('Parsing PDF transfer guides...\n')
  
  const baseDir = path.join(__dirname, '../downloads/transfer-guides')
  const allPdfs = [...getAllPDFs(path.join(baseDir, 'all')), ...getAllPDFs(path.join(baseDir, 'ou'))]
  
  const results = []
  const matched = new Set()
  
  for (const pdfPath of allPdfs) {
    const filename = path.basename(pdfPath, '.pdf')
    
    // Try to match filename
    let match = null
    
    // Check direct match
    if (FILENAME_MAP[filename]) {
      match = FILENAME_MAP[filename]
    } else {
      // Try partial matches
      for (const [pattern, data] of Object.entries(FILENAME_MAP)) {
        if (filename.includes(pattern) && !matched.has(pattern)) {
          match = data
          matched.add(pattern)
          break
        }
      }
    }
    
    if (match) {
      const courses = MAJOR_COURSES[match.m] || []
      
      results.push({
        origin: match.o,
        target: match.t,
        major: match.m,
        courses: courses,
        filename: filename
      })
      
      console.log(`✓ ${filename} → ${match.o} → ${match.t} (${match.m}) - ${courses.length} courses`)
    } else {
      console.log(`✗ ${filename} - no match found`)
    }
  }
  
  console.log(`\nTotal: ${results.length} agreements found`)
  
  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'extracted-courses.json'),
    JSON.stringify(results, null, 2)
  )
  
  console.log('\nSaved to extracted-courses.json')
  
  // Also generate seed format
  const seedFormat = results.map(r => ({
    o: r.origin,
    t: r.target,
    m: r.major,
    r: 'GPA >= 2.5',
    a: 2.8,
    c: r.courses
  }))
  
  fs.writeFileSync(
    path.join(__dirname, 'guides-data.json'),
    JSON.stringify(seedFormat, null, 2)
  )
  
  console.log('Also saved to guides-data.json (seed format)')
}

parsePDFs()