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

  // Community Colleges
  const cc = [
    { code: 'OCC', name: 'Oakland Community College', type: 'CC' },
    { code: 'Macomb', name: 'Macomb Community College', type: 'CC' },
    { code: 'Schoolcraft', name: 'Schoolcraft College', type: 'CC' },
    { code: 'WCCCD', name: 'Wayne County Community College District', type: 'CC' },
    { code: 'HenryFord', name: 'Henry Ford College', type: 'CC' },
  ]

  // Universities
  const univ = [
    { code: 'OU', name: 'Oakland University', type: 'UNIVERSITY' },
    { code: 'WSU', name: 'Wayne State University', type: 'UNIVERSITY' },
    { code: 'UMDearborn', name: 'University of Michigan-Dearborn', type: 'UNIVERSITY' },
    { code: 'UMFlint', name: 'University of Michigan-Flint', type: 'UNIVERSITY' },
    { code: 'MSU', name: 'Michigan State University', type: 'UNIVERSITY' },
  ]

  const schools: any = {}
  for (const s of [...cc, ...univ]) {
    const created = await prisma.school.upsert({ where: { code: s.code }, update: {}, create: s })
    schools[s.code] = created
  }
  console.log('Schools created')

  // Majors
  const majors = [
    { code: 'CS', name: 'Computer Science' },
    { code: 'ENG', name: 'Engineering' },
    { code: 'BUS', name: 'Business Administration' },
    { code: 'BIO', name: 'Biology' },
    { code: 'NUR', name: 'Nursing' },
  ]
  const majorIds: any = {}
  for (const m of majors) {
    const created = await prisma.major.upsert({ where: { code: m.code }, update: {}, create: m })
    majorIds[m.code] = created.id
  }
  console.log('Majors created')

  // Transfer Guides with Course Data (expanded)
  const guides = [
    // OCC → Oakland University Computer Science (from official PDF)
    { o: 'OCC', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MTH 161', n: 'Calculus I', cr: 4 },
      { c: 'MTH 162', n: 'Calculus II', cr: 4 },
      { c: 'MTH 2775', n: 'Linear Algebra', cr: 3 },
      { c: 'CSI 1420', n: 'Computer Science I', cr: 4 },
      { c: 'CSI 2320', n: 'Computer Science II', cr: 4 },
      { c: 'CSI 2300', n: 'Data Structures', cr: 4 },
      { c: 'CSI 2470', n: 'Discrete Structures', cr: 3 },
      { c: 'PHY 2400', n: 'Physics I', cr: 4 },
      { c: 'CHM 141', n: 'General Chemistry I', cr: 4 },
      { c: 'ENG 1510', n: 'Composition I', cr: 3 },
      { c: 'ENG 1520', n: 'Composition II', cr: 3 },
      { c: 'BIO 1530', n: 'General Biology I', cr: 4 },
    ] },
    { o: 'OCC', t: 'OU', m: 'ENG', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MTH 161', n: 'Calculus I', cr: 4 },
      { c: 'MTH 162', n: 'Calculus II', cr: 4 },
      { c: 'PHY 151', n: 'Physics I', cr: 4 },
      { c: 'PHY 152', n: 'Physics II', cr: 4 },
      { c: 'CHM 151', n: 'General Chemistry I', cr: 4 },
      { c: 'CHM 152', n: 'General Chemistry II', cr: 4 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
      { c: 'COM 101', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'MTH 263', n: 'Linear Algebra', cr: 3 },
      { c: 'PHY 251', n: 'Physics III', cr: 4 },
      { c: 'EGR 120', n: 'Engineering Graphics', cr: 3 },
    ] },
    { o: 'OCC', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'ACC 101', n: 'Financial Accounting', cr: 4 },
      { c: 'ACC 102', n: 'Managerial Accounting', cr: 4 },
      { c: 'ECO 201', n: 'Principles of Economics I', cr: 3 },
      { c: 'ECO 202', n: 'Principles of Economics II', cr: 3 },
      { c: 'MTH 160', n: 'Applied Calculus', cr: 4 },
      { c: 'STA 251', n: 'Statistics for Business', cr: 3 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
      { c: 'COM 101', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'BUS 101', n: 'Introduction to Business', cr: 3 },
      { c: 'MKT 201', n: 'Principles of Marketing', cr: 3 },
      { c: 'MGT 201', n: 'Principles of Management', cr: 3 },
    ] },
    { o: 'OCC', t: 'OU', m: 'BIO', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'BIO 151', n: 'General Biology I', cr: 4 },
      { c: 'BIO 152', n: 'General Biology II', cr: 4 },
      { c: 'CHM 151', n: 'General Chemistry I', cr: 4 },
      { c: 'CHM 152', n: 'General Chemistry II', cr: 4 },
      { c: 'MTH 161', n: 'Calculus I', cr: 4 },
      { c: 'PHY 151', n: 'Physics I', cr: 4 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
      { c: 'COM 101', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'CHM 251', n: 'Organic Chemistry I', cr: 4 },
      { c: 'BIO 251', n: 'Genetics', cr: 4 },
      { c: 'MTH 162', n: 'Calculus II', cr: 4 },
    ] },
    { o: 'OCC', t: 'OU', m: 'NUR', r: 'GPA >= 3.0', a: 3.2, c: [
      { c: 'BIO 151', n: 'General Biology I', cr: 4 },
      { c: 'BIO 253', n: 'Microbiology', cr: 4 },
      { c: 'CHM 151', n: 'General Chemistry I', cr: 4 },
      { c: 'PSY 251', n: 'Introduction to Psychology', cr: 3 },
      { c: 'PSY 252', n: 'Developmental Psychology', cr: 3 },
      { c: 'SOC 251', n: 'Introduction to Sociology', cr: 3 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
      { c: 'COM 101', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'NUR 101', n: 'Nursing I', cr: 4 },
      { c: 'NUR 102', n: 'Nursing II', cr: 4 },
      { c: 'BIO 254', n: 'Human Anatomy and Physiology', cr: 4 },
    ] },
    // Macomb → Oakland University Computer Science (from official PDF)
    { o: 'Macomb', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 1760', n: 'Calculus I', cr: 4 },
      { c: 'MATH 1770', n: 'Calculus II', cr: 4 },
      { c: 'MATH 2000', n: 'Linear Algebra', cr: 3 },
      { c: 'MATH 2200', n: 'Discrete Structures', cr: 3 },
      { c: 'ITCS 1140', n: 'Problem Solving & Programming', cr: 4 },
      { c: 'ITCS 1170', n: 'Object-Oriented Programming', cr: 4 },
      { c: 'ITCS 2250', n: 'Data Structures', cr: 4 },
      { c: 'ITCS 2530', n: 'Computer Systems', cr: 3 },
      { c: 'ITCS 2590', n: 'Computer Architecture', cr: 3 },
      { c: 'PHYS 2220', n: 'Physics I', cr: 4 },
      { c: 'PHYS 2230', n: 'Physics II', cr: 4 },
      { c: 'ENGL 1181', n: 'Composition I', cr: 3 },
      { c: 'ENGL 1190', n: 'Composition II', cr: 3 },
    ] },
    { o: 'Macomb', t: 'OU', m: 'ENG', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 155', n: 'Calculus I', cr: 4 },
      { c: 'MATH 156', n: 'Calculus II', cr: 4 },
      { c: 'PHYS 101', n: 'Applied Physics I', cr: 4 },
      { c: 'PHYS 102', n: 'Applied Physics II', cr: 4 },
      { c: 'CHEM 101', n: 'General Chemistry I', cr: 4 },
      { c: 'CHEM 102', n: 'General Chemistry II', cr: 4 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
      { c: 'COMM 131', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'MATH 230', n: 'Linear Algebra', cr: 3 },
      { c: 'PHYS 201', n: 'Physics III', cr: 4 },
      { c: 'EGR 120', n: 'Engineering Graphics', cr: 3 },
    ] },
    { o: 'Macomb', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'ACC 115', n: 'Financial Accounting', cr: 4 },
      { c: 'ACC 116', n: 'Managerial Accounting', cr: 4 },
      { c: 'ECON 101', n: 'Introduction to Economics', cr: 3 },
      { c: 'ECON 102', n: 'Principles of Economics', cr: 3 },
      { c: 'MATH 110', n: 'Business Mathematics', cr: 3 },
      { c: 'STAT 170', n: 'Statistics for Business', cr: 4 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
      { c: 'COMM 131', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'BUS 101', n: 'Introduction to Business', cr: 3 },
      { c: 'MKT 100', n: 'Marketing Principles', cr: 3 },
      { c: 'MGT 101', n: 'Principles of Management', cr: 3 },
    ] },
    { o: 'Macomb', t: 'OU', m: 'BIO', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'BIOL 101', n: 'General Biology I', cr: 4 },
      { c: 'BIOL 102', n: 'General Biology II', cr: 4 },
      { c: 'CHEM 101', n: 'General Chemistry I', cr: 4 },
      { c: 'CHEM 102', n: 'General Chemistry II', cr: 4 },
      { c: 'MATH 155', n: 'Calculus I', cr: 4 },
      { c: 'PHYS 101', n: 'Applied Physics I', cr: 4 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
      { c: 'COMM 131', n: 'Fundamentals of Speaking', cr: 3 },
      { c: 'CHEM 201', n: 'Organic Chemistry I', cr: 4 },
      { c: 'BIOL 201', n: 'Genetics', cr: 4 },
      { c: 'MATH 156', n: 'Calculus II', cr: 4 },
    ] },
    // Schoolcraft → Oakland University Computer Science (from official PDF)
    { o: 'Schoolcraft', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 150', n: 'Calculus I', cr: 4 },
      { c: 'MATH 151', n: 'Calculus II', cr: 4 },
      { c: 'MATH 230', n: 'Linear Algebra', cr: 3 },
      { c: 'CS 101', n: 'Introduction to Programming', cr: 4 },
      { c: 'CS 201', n: 'Data Structures', cr: 4 },
      { c: 'CS 215', n: 'Discrete Structures', cr: 3 },
      { c: 'PHYS 211', n: 'General Physics I', cr: 4 },
      { c: 'CHEM 111', n: 'General Chemistry I', cr: 4 },
      { c: 'BIOL 120', n: 'General Biology I', cr: 4 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
    ] },
    { o: 'Schoolcraft', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'ACC 101', n: 'Principles of Accounting I', cr: 3 },
      { c: 'ACC 102', n: 'Principles of Accounting II', cr: 3 },
      { c: 'ECO 201', n: 'Principles of Economics I', cr: 3 },
      { c: 'ECO 202', n: 'Principles of Economics II', cr: 3 },
      { c: 'MATH 150', n: 'Finite Mathematics', cr: 3 },
      { c: 'STAT 201', n: 'Statistics', cr: 4 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
      { c: 'SPE 101', n: 'Principles of Speech', cr: 3 },
      { c: 'BUS 101', n: 'Introduction to Business', cr: 3 },
      { c: 'MKT 201', n: 'Principles of Marketing', cr: 3 },
      { c: 'MGT 201', n: 'Principles of Management', cr: 3 },
    ] },
    { o: 'Schoolcraft', t: 'OU', m: 'BIO', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'BIO 111', n: 'General Biology I', cr: 4 },
      { c: 'BIO 112', n: 'General Biology II', cr: 4 },
      { c: 'CHEM 111', n: 'General Chemistry I', cr: 4 },
      { c: 'CHEM 112', n: 'General Chemistry II', cr: 4 },
      { c: 'MATH 183', n: 'Calculus I', cr: 4 },
      { c: 'PHYS 141', n: 'General Physics I', cr: 4 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
      { c: 'SPE 101', n: 'Principles of Speech', cr: 3 },
      { c: 'CHEM 211', n: 'Organic Chemistry I', cr: 4 },
      { c: 'BIO 211', n: 'Genetics', cr: 4 },
      { c: 'MATH 184', n: 'Calculus II', cr: 4 },
    ] },
    // Henry Ford → Oakland University Computer Science (from official PDF)
    { o: 'HenryFord', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MATH 180', n: 'Calculus I', cr: 4 },
      { c: 'MATH 183', n: 'Calculus II', cr: 4 },
      { c: 'MATH 275', n: 'Linear Algebra', cr: 3 },
      { c: 'MATH 283', n: 'Discrete Structures', cr: 3 },
      { c: 'CS 111', n: 'Computer Science I', cr: 4 },
      { c: 'CS 121', n: 'Computer Science II', cr: 4 },
      { c: 'PHYS 231', n: 'University Physics I', cr: 4 },
      { c: 'CHEM 141', n: 'General Chemistry I', cr: 4 },
      { c: 'BIO 152', n: 'General Biology I', cr: 4 },
      { c: 'ENG 131', n: 'Composition I', cr: 3 },
      { c: 'ENG 132', n: 'Composition II', cr: 3 },
    ] },
    // WCCCD → Oakland University Computer Science (PDF was corrupted - using typical courses)
    { o: 'WCCCD', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [
      { c: 'MTH 161', n: 'Calculus I', cr: 4 },
      { c: 'MTH 162', n: 'Calculus II', cr: 4 },
      { c: 'MTH 263', n: 'Linear Algebra', cr: 3 },
      { c: 'CS 101', n: 'Computer Science I', cr: 4 },
      { c: 'CS 102', n: 'Computer Science II', cr: 4 },
      { c: 'CS 220', n: 'Discrete Structures', cr: 3 },
      { c: 'PHY 151', n: 'Physics I', cr: 4 },
      { c: 'PHY 152', n: 'Physics II', cr: 4 },
      { c: 'ENG 101', n: 'Composition I', cr: 3 },
      { c: 'ENG 102', n: 'Composition II', cr: 3 },
    ] },
  ]

  for (const g of guides) {
    const courses = g.c.map((x: any) => ({ code: x.c, name: x.n, credits: x.cr }))
    await prisma.transferGuide.upsert({
      where: { originSchoolId_targetSchoolId_majorId: { originSchoolId: schools[g.o].id, targetSchoolId: schools[g.t].id, majorId: majorIds[g.m] } },
      update: {},
      create: { originSchoolId: schools[g.o].id, targetSchoolId: schools[g.t].id, majorId: majorIds[g.m], requirements: g.r, autoAdmitGPA: g.a, courses: JSON.stringify(courses) }
    })
    console.log('Guide: ' + g.o + ' -> ' + g.t)
  }

  console.log('Done!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
