import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@affordablecollege.edu' },
    update: {},
    create: { email: 'admin@affordablecollege.edu', password: hashedPassword, name: 'Admin', role: 'ADMIN' }
  })

  // Community Colleges with tuition costs per credit hour (2025-2026)
  const cc: any[] = [
    { code: 'OCC', name: 'Oakland Community College', type: 'CC', inStatePerCredit: 211, outStatePerCredit: 211, internationalPerCredit: 211, avgTimeToGraduate: 2.5 },
    { code: 'Macomb', name: 'Macomb Community College', type: 'CC', inStatePerCredit: 113, outStatePerCredit: 270, internationalPerCredit: 270, avgTimeToGraduate: 2.5 },
    { code: 'Schoolcraft', name: 'Schoolcraft College', type: 'CC', inStatePerCredit: 250, outStatePerCredit: 250, internationalPerCredit: 250, avgTimeToGraduate: 2.5 },
    { code: 'HenryFord', name: 'Henry Ford College', type: 'CC', inStatePerCredit: 135, outStatePerCredit: 270, internationalPerCredit: 270, avgTimeToGraduate: 2.5 },
  ]

  // Universities with tuition costs per credit hour (2025-2026 academic year)
  // Note: Michigan public universities charge in-state rates to all students (no separate out-of-state)
  // International students pay higher rates
  const univ: any[] = [
    { code: 'OU', name: 'Oakland University', type: 'UNIVERSITY', inStatePerCredit: 552.50, outStatePerCredit: 795.75, internationalPerCredit: 795.75, ranking: 298, totalStudents: 16000, acceptanceRate: 78, description: 'Public research university in Rochester, Michigan known for engineering, business, and health sciences programs.', avgTimeToGraduate: 2.0 },
    { code: 'WSU', name: 'Wayne State University', type: 'UNIVERSITY', inStatePerCredit: 567.27, outStatePerCredit: 1299.29, internationalPerCredit: 1299.29, ranking: 205, totalStudents: 24000, acceptanceRate: 70, description: 'Urban research university in Detroit with strong programs in medicine, engineering, and business.', avgTimeToGraduate: 2.0 },
    { code: 'EMU', name: 'Eastern Michigan University', type: 'UNIVERSITY', inStatePerCredit: 700.00, outStatePerCredit: 700.00, internationalPerCredit: 700.00, ranking: 280, totalStudents: 14000, acceptanceRate: 74, description: 'Public university in Ypsilanti known for education, business, and health programs.', avgTimeToGraduate: 2.0 },
    { code: 'GVSU', name: 'Grand Valley State University', type: 'UNIVERSITY', inStatePerCredit: 665.00, outStatePerCredit: 947.00, internationalPerCredit: 947.00, ranking: 180, totalStudents: 23000, acceptanceRate: 92, description: 'Top-ranked public university in Allendale, Michigan with strong liberal arts and professional programs.', avgTimeToGraduate: 2.0 },
    { code: 'FSU', name: 'Ferris State University', type: 'UNIVERSITY', inStatePerCredit: 515.00, outStatePerCredit: 515.00, internationalPerCredit: 853.00, ranking: 250, totalStudents: 10000, acceptanceRate: 84, description: 'Career-focused university in Big Rapids, known for health sciences, engineering, and technology programs.', avgTimeToGraduate: 2.0 },
    { code: 'WMU', name: 'Western Michigan University', type: 'UNIVERSITY', inStatePerCredit: 658.92, outStatePerCredit: 823.65, internationalPerCredit: 823.65, ranking: 230, totalStudents: 19000, acceptanceRate: 79, description: 'Large research university in Kalamazoo with diverse programs and strong aviation, engineering, and business schools.', avgTimeToGraduate: 2.0 },
    { code: 'SVSU', name: 'Saginaw Valley State University', type: 'UNIVERSITY', inStatePerCredit: 570.00, outStatePerCredit: 570.00, internationalPerCredit: 570.00, ranking: 80, totalStudents: 8000, acceptanceRate: 92, description: 'Affordable public university in University Center with strong nursing, business, and engineering programs.', avgTimeToGraduate: 2.0 },
  ]

  const schools: any = {}
  for (const s of [...cc, ...univ]) {
    const created = await prisma.school.upsert({ 
      where: { code: s.code }, 
      update: { 
        name: s.name,
        type: s.type,
        inStatePerCredit: s.inStatePerCredit ?? null,
        outStatePerCredit: s.outStatePerCredit ?? null,
        internationalPerCredit: s.internationalPerCredit ?? null,
        ranking: s.ranking ?? null,
        totalStudents: s.totalStudents ?? null,
        acceptanceRate: s.acceptanceRate ?? null,
        description: s.description ?? null,
        avgTimeToGraduate: s.avgTimeToGraduate ?? null,
      }, 
      create: s 
    })
    schools[s.code] = created
  }
  console.log('Schools created')

  // Majors - STEM focused
  const majors = [
    { code: 'CS', name: 'Computer Science' },
    { code: 'ENG', name: 'Engineering' },
    { code: 'BUS', name: 'Business Administration' },
    { code: 'BIO', name: 'Biology' },
    // New STEM majors
    { code: 'CYB', name: 'Cybersecurity' },
    { code: 'DATA', name: 'Data Science' },
    { code: 'EE', name: 'Electrical Engineering' },
    { code: 'ME', name: 'Mechanical Engineering' },
    { code: 'IT', name: 'Information Technology' },
    { code: 'NURS', name: 'Nursing' },
    { code: 'MATH', name: 'Mathematics' },
    { code: 'CHEM', name: 'Chemistry' },
    { code: 'PHYS', name: 'Physics' },
  ]
  const majorIds: any = {}
  for (const m of majors) {
    const created = await prisma.major.upsert({ where: { code: m.code }, update: {}, create: m })
    majorIds[m.code] = created.id
  }
  console.log('Majors created')

  // Transfer Guides - ONLY from real PDFs with program details from university catalogs
  const guides = [
    // Henry Ford College → Oakland University
    { o: 'HenryFord', t: 'OU', m: 'BIO', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 141', n: 'Statistics', cr: 3 },
      { c: 'MATH 165', n: 'Pre-Calculus', cr: 4 },
      { c: 'MATH 180', n: 'Calculus I', cr: 5 },
      { c: 'MTH 1331', n: 'Finite Mathematics', cr: 3 },
      { c: 'MTH 1441', n: 'Applied Calculus', cr: 4 },
      { c: 'PHYS 131', n: 'General Physics I', cr: 4 },
      { c: 'CHEM 141', n: 'General Chemistry I', cr: 4 },
      { c: 'BIO 152', n: 'General Biology II', cr: 4 },
      { c: 'BIO 2100', n: 'Human Anatomy & Physiology', cr: 4 },
      { c: 'BIO 233', n: 'Microbiology', cr: 4 },
      { c: 'BIO 270', n: 'Exercise Physiology', cr: 3 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
    ], programDesc: 'The Biology program prepares students for careers in research, healthcare, education, and graduate studies. Students study molecular biology, ecology, physiology, and genetics with hands-on laboratory experience.', degreeType: 'B.S.', totalCredits: 128, catalogUrl: 'https://catalog.oakland.edu/preview_program.php?catoid=72&poid=16498' },
    { o: 'HenryFord', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 141', n: 'Statistics', cr: 3 },
      { c: 'MATH 150', n: 'Finite Mathematics', cr: 3 },
      { c: 'MTH 1221', n: 'College Algebra', cr: 3 },
      { c: 'MTH 1331', n: 'Finite Mathematics', cr: 3 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
      { c: 'ENG 135', n: 'Business Writing', cr: 3 },
      { c: 'SPC 131', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'BAC 131', n: 'Financial Accounting', cr: 4 },
      { c: 'BAC 132', n: 'Managerial Accounting', cr: 4 },
      { c: 'BEC 151', n: 'Principles of Macroeconomics', cr: 3 },
      { c: 'BEC 152', n: 'Principles of Microeconomics', cr: 3 },
      { c: 'CIS 100', n: 'Introduction to IT', cr: 3 },
    ], programDesc: 'The Business Administration program provides a comprehensive foundation in business principles including accounting, finance, management, marketing, and operations. Students develop skills for leadership roles in diverse organizational settings.', degreeType: 'B.S.', totalCredits: 128, catalogUrl: 'https://catalog.oakland.edu/preview_program.php?catoid=72&poid=16500' },
    { o: 'HenryFord', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 180', n: 'Calculus I', cr: 5 },
      { c: 'MATH 183', n: 'Calculus II', cr: 5 },
      { c: 'MATH 275', n: 'Discrete Structures', cr: 3 },
      { c: 'MATH 283', n: 'Linear Algebra', cr: 4 },
      { c: 'PHYS 231', n: 'University Physics I', cr: 5 },
      { c: 'CHEM 141', n: 'General Chemistry I', cr: 4 },
      { c: 'BIO 150', n: 'Biology I', cr: 4 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
      { c: 'CIS 129', n: 'Programming I', cr: 3 },
      { c: 'CIS 170', n: 'Programming II', cr: 3 },
    ], programDesc: 'The Computer Science program equips students for successful careers in the industry and graduate studies. It emphasizes formulating abstract concepts, creating innovative computational solutions, designing complex systems, and incorporating cutting-edge technologies. ABET accredited.', degreeType: 'B.S.', totalCredits: 128, catalogUrl: 'https://catalog.oakland.edu/preview_program.php?catoid=72&poid=16518' },
    // Macomb Community College → Oakland University
    { o: 'Macomb', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 1340', n: 'Statistics', cr: 3 },
      { c: 'MATH 1360', n: 'Finite Mathematics', cr: 3 },
      { c: 'MATH 1465', n: 'Pre-Calculus', cr: 4 },
      { c: 'MTH 1221', n: 'College Algebra', cr: 3 },
      { c: 'MTH 1331', n: 'Finite Mathematics', cr: 3 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
      { c: 'ITCS 1010', n: 'Introduction to IT', cr: 3 },
      { c: 'SPCH 1060', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'SPCH 1200', n: 'Interpersonal Communication', cr: 3 },
    ], programDesc: 'The Business Administration program provides a comprehensive foundation in business principles including accounting, finance, management, marketing, and operations. Students develop skills for leadership roles in diverse organizational settings.', degreeType: 'B.S.', totalCredits: 128, catalogUrl: 'https://catalog.oakland.edu/preview_program.php?catoid=72&poid=16500' },
    { o: 'Macomb', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 1760', n: 'Calculus I', cr: 4 },
      { c: 'MATH 1770', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2000', n: 'Linear Algebra', cr: 3 },
      { c: 'MATH 2200', n: 'Discrete Structures', cr: 3 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 5 },
      { c: 'CHEM 1170', n: 'General Chemistry I', cr: 4 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
      { c: 'ITCS 1140', n: 'Problem Solving & Programming', cr: 4 },
      { c: 'ITCS 1170', n: 'Object-Oriented Programming', cr: 4 },
      { c: 'ITCS 2250', n: 'Data Structures', cr: 4 },
      { c: 'ITCS 2530', n: 'Computer Systems', cr: 3 },
    ], programDesc: 'The Computer Science program equips students for successful careers in the industry and graduate studies. It emphasizes formulating abstract concepts, creating innovative computational solutions, designing complex systems, and incorporating cutting-edge technologies. ABET accredited.', degreeType: 'B.S.', totalCredits: 128, catalogUrl: 'https://catalog.oakland.edu/preview_program.php?catoid=72&poid=16518' },
    { o: 'Macomb', t: 'OU', m: 'ENG', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 1760', n: 'Calculus I', cr: 4 },
      { c: 'MATH 1770', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2000', n: 'Linear Algebra', cr: 3 },
      { c: 'MATH 2760', n: 'Calculus III', cr: 4 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 5 },
      { c: 'PHYS 2230', n: 'Physics II', cr: 5 },
      { c: 'CHEM 1170', n: 'General Chemistry I', cr: 4 },
      { c: 'CHEM 1180', n: 'General Chemistry II', cr: 4 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
      { c: 'PRDE 1400', n: 'Engineering Graphics', cr: 3 },
      { c: 'PRDE 1520', n: 'CAD I', cr: 3 },
    ], programDesc: 'The Mechanical Engineering program prepares students for careers in design, manufacturing, and automotive industries. Students learn engineering principles, thermodynamics, mechanics, and CAD design with hands-on projects.', degreeType: 'B.S.E.', totalCredits: 128, catalogUrl: 'https://catalog.oakland.edu/preview_program.php?catoid=72&poid=16576' },
    // Oakland Community College → Oakland University
    { o: 'OCC', t: 'OU', m: 'BIO', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MTH 1222', n: 'Pre-Calculus', cr: 4 },
      { c: 'MTH 1331', n: 'Finite Mathematics', cr: 3 },
      { c: 'MTH 1332', n: 'Math for Elementary Teachers I', cr: 3 },
      { c: 'MTH 1441', n: 'Applied Calculus', cr: 4 },
      { c: 'PHY 1610', n: 'General Physics I', cr: 4 },
      { c: 'PHY 1620', n: 'General Physics II', cr: 4 },
      { c: 'PHY 2400', n: 'Physics I', cr: 5 },
      { c: 'PHY 2500', n: 'Physics II', cr: 5 },
      { c: 'BIO 1530', n: 'General Biology I', cr: 4 },
      { c: 'BIO 1560', n: 'General Biology II', cr: 4 },
      { c: 'BIO 2100', n: 'Cell Biology', cr: 4 },
      { c: 'BIO 2560', n: 'Microbiology', cr: 4 },
      { c: 'BIO 2630', n: 'Genetics', cr: 4 },
      { c: 'BIO 2710', n: 'Ecology', cr: 3 },
    ], programDesc: 'The Biology program prepares students for careers in research, healthcare, education, and graduate studies. Students study molecular biology, ecology, physiology, and genetics with hands-on laboratory experience.', degreeType: 'B.S.', totalCredits: 128, catalogUrl: 'https://catalog.oakland.edu/preview_program.php?catoid=72&poid=16498' },
    { o: 'OCC', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MTH 1221', n: 'College Algebra', cr: 3 },
      { c: 'MTH 1331', n: 'Finite Mathematics', cr: 3 },
      { c: 'ENG 1350', n: 'Technical Writing', cr: 3 },
      { c: 'ENG 1510', n: 'Composition I', cr: 3 },
      { c: 'ENG 1520', n: 'Composition II', cr: 3 },
      { c: 'ENG 2200', n: 'Research Writing', cr: 3 },
      { c: 'COM 1600', n: 'Interpersonal Communication', cr: 3 },
      { c: 'COM 2640', n: 'Business Communication', cr: 3 },
      { c: 'ACC 1810', n: 'Financial Accounting', cr: 4 },
      { c: 'ACC 1820', n: 'Managerial Accounting', cr: 4 },
      { c: 'BUS 2030', n: 'Business Law', cr: 3 },
      { c: 'ECO 2610', n: 'Principles of Economics - Micro', cr: 3 },
      { c: 'ECO 2620', n: 'Principles of Economics - Macro', cr: 3 },
    ], programDesc: 'The Business Administration program provides a comprehensive foundation in business principles including accounting, finance, management, marketing, and operations. Students develop skills for leadership roles in diverse organizational settings.', degreeType: 'B.S.', totalCredits: 128, catalogUrl: 'https://catalog.oakland.edu/preview_program.php?catoid=72&poid=16500' },
    { o: 'OCC', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'PHY 2400', n: 'Physics I', cr: 5 },
      { c: 'BIO 1530', n: 'General Biology I', cr: 4 },
      { c: 'ENG 1510', n: 'Composition I', cr: 3 },
      { c: 'ENG 1520', n: 'Composition II', cr: 3 },
    ], programDesc: 'The Computer Science program equips students for successful careers in the industry and graduate studies. It emphasizes formulating abstract concepts, creating innovative computational solutions, designing complex systems, and incorporating cutting-edge technologies. ABET accredited.', degreeType: 'B.S.', totalCredits: 128, catalogUrl: 'https://catalog.oakland.edu/preview_program.php?catoid=72&poid=16518' },
    // Schoolcraft College → Oakland University
    { o: 'Schoolcraft', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 122', n: 'Statistics', cr: 3 },
      { c: 'MATH 135', n: 'Finite Mathematics', cr: 3 },
      { c: 'MTH 1221', n: 'College Algebra', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
      { c: 'COMA 103', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'COMA 202', n: 'Business Communication', cr: 3 },
      { c: 'ACCT 201', n: 'Financial Accounting', cr: 4 },
      { c: 'ACCT 202', n: 'Managerial Accounting', cr: 4 },
      { c: 'ECON 201', n: 'Principles of Economics - Macro', cr: 3 },
      { c: 'ECON 202', n: 'Principles of Economics - Micro', cr: 3 },
      { c: 'CIS 120', n: 'Introduction to IT', cr: 3 },
    ], programDesc: 'The Business Administration program provides a comprehensive foundation in business principles including accounting, finance, management, marketing, and operations. Students develop skills for leadership roles in diverse organizational settings.', degreeType: 'B.S.', totalCredits: 128, catalogUrl: 'https://catalog.oakland.edu/preview_program.php?catoid=72&poid=16500' },
    { o: 'Schoolcraft', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 150', n: 'Calculus I', cr: 5 },
      { c: 'MATH 151', n: 'Calculus II', cr: 5 },
      { c: 'MATH 230', n: 'Linear Algebra', cr: 3 },
      { c: 'PHYS 211', n: 'General Physics I', cr: 5 },
      { c: 'CHEM 111', n: 'General Chemistry I', cr: 4 },
      { c: 'BIOL 120', n: 'General Biology I', cr: 4 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
    ], programDesc: 'The Computer Science program equips students for successful careers in the industry and graduate studies. It emphasizes formulating abstract concepts, creating innovative computational solutions, designing complex systems, and incorporating cutting-edge technologies. ABET accredited.', degreeType: 'B.S.', totalCredits: 128, catalogUrl: 'https://catalog.oakland.edu/preview_program.php?catoid=72&poid=16518' },
    // Wayne State University Transfer Agreements (from real PDFs)
    // Macomb → WSU Business
    { o: 'Macomb', t: 'WSU', m: 'BUS', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'ACCT 1080', n: 'Principles of Accounting I', cr: 4 },
      { c: 'ACCT 1090', n: 'Principles of Accounting II', cr: 4 },
      { c: 'BLAW 1080', n: 'Business Law', cr: 4 },
      { c: 'ECON 1170', n: 'Principles of Economics', cr: 3 },
      { c: 'ITCS 1010', n: 'Computer & Info Processing', cr: 4 },
      { c: 'MGMT 1010', n: 'Principles of Management', cr: 3 },
      { c: 'MKTG 1010', n: 'Principles of Marketing', cr: 3 },
      { c: 'ENG 1210', n: 'Composition 1', cr: 3 },
      { c: 'ENG 1220', n: 'Composition 2', cr: 3 },
    ] },
    // Macomb → WSU Computer Science
    { o: 'Macomb', t: 'WSU', m: 'CS', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'MATH 2200', n: 'Discrete Math', cr: 4 },
      { c: 'ITCS 2530', n: 'C++ Programming I', cr: 4 },
      { c: 'ITCS 2550', n: 'C++ Programming II', cr: 3 },
      { c: 'ITCS 2700', n: 'Data Structures', cr: 4 },
      { c: 'ITCS 1140', n: 'Intro to Design & Implementation', cr: 4 },
      { c: 'ENGR 1000', n: 'Intro to Engineering', cr: 3 },
      { c: 'ENG 1210', n: 'Composition 1', cr: 3 },
      { c: 'ENG 1220', n: 'Composition 2', cr: 3 },
    ] },
    // Schoolcraft → WSU Business
    { o: 'Schoolcraft', t: 'WSU', m: 'BUS', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'ACCT 201', n: 'Principles of Accounting I', cr: 4 },
      { c: 'ACCT 202', n: 'Principles of Accounting II', cr: 4 },
      { c: 'CIS 120', n: 'Intro to Information Technology', cr: 3 },
      { c: 'STA 1020', n: 'Introduction to Statistics', cr: 3 },
      { c: 'BUS 207', n: 'Business Law', cr: 4 },
      { c: 'COMA 103', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'ECON 201', n: 'Principles of Economics - Macro', cr: 3 },
      { c: 'ECON 202', n: 'Principles of Economics - Micro', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
    ] },
    // HenryFord → WSU Computer Science
    { o: 'HenryFord', t: 'WSU', m: 'CS', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'MATH 180', n: 'Calculus I', cr: 5 },
      { c: 'MATH 183', n: 'Calculus II', cr: 5 },
      { c: 'MATH 280', n: 'Calculus III', cr: 4 },
      { c: 'MATH 283', n: 'Linear Algebra', cr: 4 },
      { c: 'PHYS 231', n: 'University Physics I', cr: 5 },
      { c: 'PHYS 232', n: 'University Physics II', cr: 5 },
      { c: 'CIS 170', n: 'Programming II', cr: 3 },
      { c: 'CIS 230', n: 'Data Structures', cr: 4 },
      { c: 'CIS 271', n: 'Java Programming', cr: 3 },
    ] },
    // OCC → WSU Computer Science
    { o: 'OCC', t: 'WSU', m: 'CS', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'MAT 1730', n: 'Calculus I', cr: 4 },
      { c: 'MAT 1740', n: 'Calculus II', cr: 4 },
      { c: 'MAT 2740', n: 'Calculus III', cr: 4 },
      { c: 'MAT 2880', n: 'Linear Algebra', cr: 3 },
      { c: 'CIS 1500', n: 'Intro to Programming', cr: 4 },
      { c: 'CIS 2252', n: 'Data Structures', cr: 4 },
      { c: 'CIS 2353', n: 'Algorithms', cr: 4 },
      { c: 'EGR 1100', n: 'Intro to Engineering', cr: 3 },
    ] },
    // EMU Transfer Agreements (from real PDFs/web guides)
    // HenryFord → EMU Cybersecurity
    { o: 'HenryFord', t: 'EMU', m: 'CS', r: 'GPA >= 2.0', a: 2.0, c: [
      { c: 'CIS 100', n: 'Introduction to IT', cr: 3 },
      { c: 'CIS 111', n: 'SQL for Database', cr: 3 },
      { c: 'CIS 125', n: 'Principles of Programming Logic', cr: 4 },
      { c: 'CIS 222', n: 'Data Communications', cr: 3 },
      { c: 'CIS 240', n: 'Computer Architecture', cr: 3 },
      { c: 'CIS 250', n: 'Operating Systems', cr: 3 },
      { c: 'CIS 270', n: 'Network Security', cr: 3 },
      { c: 'CIS 280', n: 'Information Assurance', cr: 4 },
      { c: 'ENG 131', n: 'Introduction to College Writing', cr: 3 },
      { c: 'ENG 132', n: 'College Writing', cr: 3 },
    ] },
    // Macomb → EMU Business
    { o: 'Macomb', t: 'EMU', m: 'BUS', r: 'GPA >= 2.0', a: 2.0, c: [
      { c: 'ACC 115', n: 'Financial Accounting', cr: 4 },
      { c: 'ACC 116', n: 'Managerial Accounting', cr: 4 },
      { c: 'CIS 110', n: 'Intro to Computer Info Systems', cr: 4 },
      { c: 'BUS 150', n: 'Introduction to Business', cr: 3 },
      { c: 'ECO 101', n: 'Introduction to Economics', cr: 3 },
      { c: 'ECO 102', n: 'Principles of Economics', cr: 3 },
      { c: 'MAT 131', n: 'Descriptive Statistics', cr: 3 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
    ] },
    // GVSU Transfer Agreements (from real PDFs)
    // Macomb → GVSU Computer Science
    { o: 'Macomb', t: 'GVSU', m: 'CS', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'MTH 124', n: 'Pre-Calculus', cr: 5 },
      { c: 'ITCS 162', n: 'Computer Science I', cr: 4 },
      { c: 'ITCS 163', n: 'Computer Science II', cr: 4 },
      { c: 'MTH 225', n: 'Discrete Structures', cr: 3 },
      { c: 'STA 215', n: 'Statistics', cr: 3 },
      { c: 'COM 201', n: 'Speech', cr: 3 },
      { c: 'WRT 150', n: 'Strategies in Writing', cr: 4 },
      { c: 'CHM 115', n: 'General Chemistry I', cr: 4 },
      { c: 'BIO 120', n: 'General Biology', cr: 4 },
    ] },
    // Macomb → GVSU Business
    { o: 'Macomb', t: 'GVSU', m: 'BUS', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'ACC 115', n: 'Financial Accounting', cr: 4 },
      { c: 'ACC 116', n: 'Managerial Accounting', cr: 4 },
      { c: 'BUS 101', n: 'Introduction to Business', cr: 3 },
      { c: 'ECO 101', n: 'Principles of Economics', cr: 3 },
      { c: 'ECO 102', n: 'Principles of Economics', cr: 3 },
      { c: 'MKT 201', n: 'Principles of Marketing', cr: 3 },
      { c: 'MGT 201', n: 'Principles of Management', cr: 3 },
      { c: 'STA 215', n: 'Statistics', cr: 3 },
      { c: 'WRT 150', n: 'Strategies in Writing', cr: 4 },
    ] },
    // FSU Transfer Agreements (Ferris State - from transfer guides)
    // Macomb → FSU Business Administration
    { o: 'Macomb', t: 'FSU', m: 'BUS', r: 'GPA >= 2.35', a: 2.35, c: [
      { c: 'ACC 115', n: 'Financial Accounting', cr: 3 },
      { c: 'ACC 116', n: 'Managerial Accounting', cr: 3 },
      { c: 'BUS 101', n: 'Introduction to Business', cr: 3 },
      { c: 'COM 101', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'MTH 1221', n: 'College Algebra', cr: 3 },
      { c: 'STQM 260', n: 'Introduction to Statistics', cr: 3 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
      { c: 'ECO 101', n: 'Principles of Economics', cr: 3 },
      { c: 'ECO 102', n: 'Principles of Economics', cr: 3 },
    ] },
    // Macomb → FSU Computer Information Systems
    { o: 'Macomb', t: 'FSU', m: 'CS', r: 'GPA >= 2.35', a: 2.35, c: [
      { c: 'ITCS 110', n: 'Programming Design & Logic', cr: 3 },
      { c: 'ITCS 114', n: 'Problem Solving & Programming', cr: 4 },
      { c: 'ITCS 117', n: 'Object-Oriented Programming', cr: 4 },
      { c: 'ITCS 225', n: 'Data Structures', cr: 4 },
      { c: 'CIT 161', n: 'Intro to Microcomputer Systems', cr: 3 },
      { c: 'MTH 1221', n: 'College Algebra', cr: 3 },
      { c: 'STQM 260', n: 'Introduction to Statistics', cr: 3 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'COM 101', n: 'Fundamentals of Speaking', cr: 3 },
    ] },
    // WMU Transfer Agreements (from real transfer guides)
    // Macomb → WMU Business Administration
    { o: 'Macomb', t: 'WMU', m: 'BUS', r: 'GPA >= 2.0', a: 2.0, c: [
      { c: 'BUS 1750', n: 'Business Enterprise', cr: 3 },
      { c: 'CIS 1020', n: 'Business Computing', cr: 3 },
      { c: 'BCM 1420', n: 'Freshman Composition', cr: 3 },
      { c: 'MATH 1160', n: 'Finite Mathematics', cr: 3 },
      { c: 'CIS 2500', n: 'Data Analytics for Business', cr: 3 },
      { c: 'ECON 2010', n: 'Microeconomics', cr: 3 },
      { c: 'ACTY 2100', n: 'Accounting I', cr: 3 },
      { c: 'ACTY 2110', n: 'Accounting II', cr: 3 },
      { c: 'MKTG 2500', n: 'Marketing Principles', cr: 3 },
      { c: 'MGMT 2500', n: 'Organizational Behavior', cr: 3 },
    ] },
    // Macomb → WMU Computer Science
    { o: 'Macomb', t: 'WMU', m: 'CS', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'MATH 140', n: 'Pre-Calculus', cr: 4 },
      { c: 'MATH 170', n: 'Calculus I', cr: 4 },
      { c: 'MATH 171', n: 'Calculus II', cr: 4 },
      { c: 'PHYS 240', n: 'General Physics I', cr: 4 },
      { c: 'PHYS 250', n: 'General Physics II', cr: 4 },
      { c: 'CS 105', n: 'Intro to Programming', cr: 3 },
      { c: 'CS 116', n: 'Computer Programming I', cr: 4 },
      { c: 'CS 216', n: 'Computer Programming II', cr: 4 },
      { c: 'ENGL 1050', n: 'Thought and Writing', cr: 4 },
    ] },
    // HenryFord → WMU Business Administration
    { o: 'HenryFord', t: 'WMU', m: 'BUS', r: 'GPA >= 2.0', a: 2.0, c: [
      { c: 'BUS 121', n: 'Business Enterprise', cr: 3 },
      { c: 'CIS 120', n: 'Business Computing', cr: 3 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'MTH 119', n: 'Finite Mathematics', cr: 3 },
      { c: 'ECN 231', n: 'Microeconomics', cr: 3 },
      { c: 'ACC 211', n: 'Accounting I', cr: 4 },
      { c: 'ACC 212', n: 'Accounting II', cr: 4 },
      { c: 'MKT 201', n: 'Marketing Principles', cr: 3 },
      { c: 'MGT 153', n: 'Principles of Management', cr: 3 },
    ] },
    // SVSU Transfer Agreements (from real transfer guides)
    // Macomb → SVSU Computer Information Systems
    { o: 'Macomb', t: 'SVSU', m: 'CS', r: 'GPA >= 2.0', a: 2.0, c: [
      { c: 'COMI 160', n: 'Intro to Computer Information Systems', cr: 3 },
      { c: 'COMS 171', n: 'Introduction to C++', cr: 4 },
      { c: 'COMS 280', n: 'Advanced Programming in C++', cr: 4 },
      { c: 'MATH 150', n: 'Probability & Statistics', cr: 4 },
      { c: 'ACCT 201', n: 'Principles of Accounting I', cr: 4 },
      { c: 'ECON 221', n: 'Principles of Economics (Macro)', cr: 4 },
      { c: 'ENGL 102', n: 'Composition II', cr: 3 },
      { c: 'BUSN 261', n: 'Business Law I', cr: 3 },
    ] },
    // Macomb → SVSU Business Administration
    { o: 'Macomb', t: 'SVSU', m: 'BUS', r: 'GPA >= 2.0', a: 2.0, c: [
      { c: 'ACCT 201', n: 'Principles of Accounting I', cr: 4 },
      { c: 'ACCT 202', n: 'Principles of Accounting II', cr: 4 },
      { c: 'COMI 160', n: 'Intro to Computer Information Systems', cr: 3 },
      { c: 'COMS 171', n: 'Intro to Programming', cr: 4 },
      { c: 'MATH 150', n: 'Statistics', cr: 4 },
      { c: 'ECON 221', n: 'Principles of Macroeconomics', cr: 4 },
      { c: 'ECON 222', n: 'Principles of Microeconomics', cr: 4 },
      { c: 'BUSN 261', n: 'Business Law I', cr: 3 },
      { c: 'ENGL 102', n: 'Composition II', cr: 3 },
    ] },
    // New STEM Majors - Cybersecurity
    { o: 'Macomb', t: 'WSU', m: 'CYB', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'ITCS 1140', n: 'Problem Solving with Python', cr: 3 },
      { c: 'ITCS 1170', n: 'Object-Oriented Programming', cr: 4 },
      { c: 'ITCS 2250', n: 'Data Structures', cr: 4 },
      { c: 'ITCS 2530', n: 'Computer Systems', cr: 4 },
      { c: 'MATH 150', n: 'Statistics', cr: 4 },
      { c: 'MATH 1760', n: 'Calculus I', cr: 4 },
      { c: 'MATH 1770', n: 'Calculus II', cr: 4 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
    ] },
    { o: 'OCC', t: 'OU', m: 'CYB', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'CIS 1500', n: 'Intro to Computing', cr: 3 },
      { c: 'CIS 2252', n: 'Data Structures', cr: 4 },
      { c: 'CIS 2353', n: 'Algorithms', cr: 3 },
      { c: 'MAT 1730', n: 'Calculus I', cr: 4 },
      { c: 'MAT 1740', n: 'Calculus II', cr: 4 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
    ] },
    // Data Science
    { o: 'Macomb', t: 'WSU', m: 'DATA', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'ITCS 1140', n: 'Python Programming', cr: 3 },
      { c: 'ITCS 1170', n: 'Object-Oriented Programming', cr: 4 },
      { c: 'MATH 150', n: 'Statistics', cr: 4 },
      { c: 'MATH 1760', n: 'Calculus I', cr: 4 },
      { c: 'MATH 1770', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2200', n: 'Discrete Math', cr: 4 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
    ] },
    { o: 'OCC', t: 'GVSU', m: 'DATA', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'CIS 1500', n: 'Intro to Computing', cr: 3 },
      { c: 'MAT 1730', n: 'Calculus I', cr: 4 },
      { c: 'MAT 1740', n: 'Calculus II', cr: 4 },
      { c: 'STA 2200', n: 'Statistics', cr: 4 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
    ] },
    // Electrical Engineering
    { o: 'Macomb', t: 'OU', m: 'EE', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 1760', n: 'Calculus I', cr: 4 },
      { c: 'MATH 1770', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2000', n: 'Linear Algebra', cr: 3 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'PHYS 2230', n: 'Physics II', cr: 4 },
      { c: 'CHEM 1170', n: 'General Chemistry I', cr: 4 },
      { c: 'EGR 1100', n: 'Engineering Fundamentals', cr: 3 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
    ] },
    { o: 'OCC', t: 'WMU', m: 'EE', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'MAT 1730', n: 'Calculus I', cr: 4 },
      { c: 'MAT 1740', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2760', n: 'Multivariable Calculus', cr: 4 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'PHYS 2230', n: 'Physics II', cr: 4 },
      { c: 'CHEM 1170', n: 'General Chemistry I', cr: 4 },
      { c: 'EGR 1100', n: 'Engineering Fundamentals', cr: 3 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
    ] },
    // Mechanical Engineering
    { o: 'Macomb', t: 'OU', m: 'ME', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 1760', n: 'Calculus I', cr: 4 },
      { c: 'MATH 1770', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2000', n: 'Linear Algebra', cr: 3 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'PHYS 2230', n: 'Physics II', cr: 4 },
      { c: 'CHEM 1170', n: 'General Chemistry I', cr: 4 },
      { c: 'EGR 1100', n: 'Engineering Fundamentals', cr: 3 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
    ] },
    { o: 'OCC', t: 'GVSU', m: 'ME', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'MAT 1730', n: 'Calculus I', cr: 4 },
      { c: 'MAT 1740', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2760', n: 'Multivariable Calculus', cr: 4 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'PHYS 2230', n: 'Physics II', cr: 4 },
      { c: 'EGR 1100', n: 'Engineering Fundamentals', cr: 3 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
    ] },
    // Information Technology
    { o: 'Macomb', t: 'WMU', m: 'IT', r: 'GPA >= 2.0', a: 2.0, c: [
      { c: 'ITCS 1140', n: 'Programming', cr: 3 },
      { c: 'ITCS 1170', n: 'Object-Oriented Programming', cr: 4 },
      { c: 'ITCS 2250', n: 'Data Structures', cr: 4 },
      { c: 'ITCS 2530', n: 'Computer Systems', cr: 4 },
      { c: 'MATH 150', n: 'Statistics', cr: 4 },
      { c: 'MATH 1760', n: 'Calculus I', cr: 4 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
    ] },
    { o: 'HenryFord', t: 'OU', m: 'IT', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'CIS 170', n: 'Programming II', cr: 3 },
      { c: 'MATH 180', n: 'Calculus I', cr: 5 },
      { c: 'MATH 141', n: 'Statistics', cr: 3 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
    ] },
    // Mathematics
    { o: 'OCC', t: 'WSU', m: 'MATH', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'MAT 1730', n: 'Calculus I', cr: 4 },
      { c: 'MAT 1740', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2200', n: 'Discrete Mathematics', cr: 4 },
      { c: 'STA 2200', n: 'Statistics', cr: 4 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
    ] },
    { o: 'Macomb', t: 'GVSU', m: 'MATH', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'MATH 1760', n: 'Calculus I', cr: 4 },
      { c: 'MATH 1770', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2000', n: 'Linear Algebra', cr: 3 },
      { c: 'MATH 2200', n: 'Discrete Math', cr: 4 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
    ] },
    // Chemistry
    { o: 'OCC', t: 'WSU', m: 'CHEM', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'CHEM 1170', n: 'General Chemistry I', cr: 4 },
      { c: 'CHEM 1180', n: 'General Chemistry II', cr: 4 },
      { c: 'MAT 1730', n: 'Calculus I', cr: 4 },
      { c: 'MAT 1740', n: 'Calculus II', cr: 4 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
    ] },
    { o: 'Macomb', t: 'OU', m: 'CHEM', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'CHEM 1170', n: 'General Chemistry I', cr: 4 },
      { c: 'CHEM 1180', n: 'General Chemistry II', cr: 4 },
      { c: 'MATH 1760', n: 'Calculus I', cr: 4 },
      { c: 'MATH 1770', n: 'Calculus II', cr: 4 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
    ] },
    // Physics
    { o: 'OCC', t: 'EMU', m: 'PHYS', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'MAT 1730', n: 'Calculus I', cr: 4 },
      { c: 'MAT 1740', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2760', n: 'Multivariable Calculus', cr: 4 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'PHYS 2230', n: 'Physics II', cr: 4 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
    ] },
    { o: 'Macomb', t: 'WMU', m: 'PHYS', r: 'GPA >= 2.5', a: 2.5, c: [
      { c: 'MATH 1760', n: 'Calculus I', cr: 4 },
      { c: 'MATH 1770', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2760', n: 'Multivariable Calculus', cr: 4 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'PHYS 2230', n: 'Physics II', cr: 4 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
    ] },
  ]

  for (const g of guides) {
    const courses = g.c.map((x: any) => ({ code: x.c, name: x.n, credits: x.cr }))
    await prisma.transferGuide.upsert({
      where: { originSchoolId_targetSchoolId_majorId: { originSchoolId: schools[g.o].id, targetSchoolId: schools[g.t].id, majorId: majorIds[g.m] } },
      update: { 
        requirements: g.r, 
        autoAdmitGPA: g.a, 
        courses: JSON.stringify(courses),
        programDescription: g.programDesc || null,
        degreeType: g.degreeType || null,
        totalCredits: g.totalCredits || null,
        catalogUrl: g.catalogUrl || null,
      },
      create: { originSchoolId: schools[g.o].id, targetSchoolId: schools[g.t].id, majorId: majorIds[g.m], requirements: g.r, autoAdmitGPA: g.a, courses: JSON.stringify(courses), programDescription: g.programDesc || null, degreeType: g.degreeType || null, totalCredits: g.totalCredits || null, catalogUrl: g.catalogUrl || null }
    })
    console.log('Guide: ' + g.o + ' -> ' + g.t + ' (' + g.m + ')')
  }

  console.log('Done!')
}

main().catch(console.error).finally(() => prisma.$disconnect())