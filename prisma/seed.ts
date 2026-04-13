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

  // Transfer Guides
  const guides = [
    // OCC → Oakland University
    { o: 'OCC', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [] },
    { o: 'OCC', t: 'OU', m: 'ENG', r: 'GPA >= 2.5', a: 2.8, c: [] },
    { o: 'OCC', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [] },
    { o: 'OCC', t: 'OU', m: 'BIO', r: 'GPA >= 2.5', a: 2.8, c: [] },
    { o: 'OCC', t: 'OU', m: 'NUR', r: 'GPA >= 3.0', a: 3.2, c: [] },
    
    // Macomb → Oakland University
    { o: 'Macomb', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [] },
    { o: 'Macomb', t: 'OU', m: 'ENG', r: 'GPA >= 2.5', a: 2.8, c: [] },
    { o: 'Macomb', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [] },
    { o: 'Macomb', t: 'OU', m: 'BIO', r: 'GPA >= 2.5', a: 2.8, c: [] },
    
    // Schoolcraft → Oakland University
    { o: 'Schoolcraft', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [] },
    { o: 'Schoolcraft', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [] },
    { o: 'Schoolcraft', t: 'OU', m: 'BIO', r: 'GPA >= 2.5', a: 2.8, c: [] },
    
    // Henry Ford → Oakland University
    { o: 'HenryFord', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [] },
    
    // WCCCD → Oakland University
    { o: 'WCCCD', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [] },
    
    // Previous agreements (kept for reference)
    // { o: 'OCC', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'MTH 161', n: 'Calculus I', cr: 4 }, { c: 'MTH 162', n: 'Calculus II', cr: 4 }, { c: 'CS 150', n: 'Intro to CS', cr: 3 }] },
    // { o: 'OCC', t: 'OU', m: 'ENG', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'MTH 161', n: 'Calculus I', cr: 4 }, { c: 'PHY 151', n: 'Physics I', cr: 4 }] },
    // { o: 'OCC', t: 'WSU', m: 'CS', r: 'GPA >= 2.5', a: null, c: [{ c: 'MTH 161', n: 'Calculus I', cr: 4 }, { c: 'CS 150', n: 'Intro to CS', cr: 3 }] },
    // { o: 'Macomb', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'MATH 155', n: 'Calculus I', cr: 4 }, { c: 'CS 100', n: 'Problem Solving', cr: 3 }] },
    // { o: 'Macomb', t: 'WSU', m: 'BUS', r: 'GPA >= 2.5', a: null, c: [{ c: 'ACC 101', n: 'Financial Accounting', cr: 3 }, { c: 'ECO 201', n: 'Economics I', cr: 3 }] },
    // { o: 'Schoolcraft', t: 'WSU', m: 'CS', r: 'GPA >= 2.5', a: null, c: [{ c: 'MATH 183', n: 'Calculus I', cr: 4 }, { c: 'CS 100', n: 'Intro to Programming', cr: 3 }] },
    // { o: 'WCCCD', t: 'WSU', m: 'BUS', r: 'GPA >= 2.5', a: null, c: [{ c: 'ACC 101', n: 'Financial Accounting', cr: 3 }, { c: 'BUS 101', n: 'Intro to Business', cr: 3 }] },
    // { o: 'HenryFord', t: 'UMDearborn', m: 'ENG', r: 'GPA >= 3.0', a: 3.2, c: [{ c: 'MTH 180', n: 'Calculus I', cr: 4 }, { c: 'PHY 180', n: 'Physics I', cr: 4 }] },
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
