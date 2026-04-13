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
    // OCC → Oakland University (5 majors)
    { o: 'OCC', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'MTH 161', n: 'Calculus I', cr: 4 }, { c: 'MTH 162', n: 'Calculus II', cr: 4 }, { c: 'CS 150', n: 'Intro to CS', cr: 3 }, { c: 'CS 210', n: 'Data Structures', cr: 3 }] },
    { o: 'OCC', t: 'OU', m: 'ENG', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'MTH 161', n: 'Calculus I', cr: 4 }, { c: 'PHY 151', n: 'Physics I', cr: 4 }, { c: 'PHY 152', n: 'Physics II', cr: 4 }, { c: 'CHM 151', n: 'Chemistry I', cr: 4 }] },
    { o: 'OCC', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'ACC 101', n: 'Financial Accounting', cr: 3 }, { c: 'ACC 102', n: 'Managerial Accounting', cr: 3 }, { c: 'ECO 201', n: 'Economics I', cr: 3 }, { c: 'ECO 202', n: 'Economics II', cr: 3 }] },
    { o: 'OCC', t: 'OU', m: 'BIO', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'BIO 151', n: 'General Biology I', cr: 4 }, { c: 'BIO 152', n: 'General Biology II', cr: 4 }, { c: 'CHM 151', n: 'Chemistry I', cr: 4 }, { c: 'MTH 161', n: 'Calculus I', cr: 4 }] },
    { o: 'OCC', t: 'OU', m: 'NUR', r: 'GPA >= 3.0', a: 3.2, c: [{ c: 'BIO 151', n: 'General Biology I', cr: 4 }, { c: 'BIO 253', n: 'Microbiology', cr: 4 }, { c: 'CHM 151', n: 'Chemistry I', cr: 4 }, { c: 'PSY 251', n: 'Psychology', cr: 3 }] },
    // Macomb → Oakland University (4 majors)
    { o: 'Macomb', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'MATH 155', n: 'Calculus I', cr: 4 }, { c: 'MATH 156', n: 'Calculus II', cr: 4 }, { c: 'CS 100', n: 'Problem Solving', cr: 3 }, { c: 'CS 110', n: 'OOP', cr: 3 }] },
    { o: 'Macomb', t: 'OU', m: 'ENG', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'MATH 155', n: 'Calculus I', cr: 4 }, { c: 'PHYS 101', n: 'Physics I', cr: 4 }, { c: 'PHYS 102', n: 'Physics II', cr: 4 }, { c: 'CHEM 101', n: 'Chemistry I', cr: 4 }] },
    { o: 'Macomb', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'ACC 115', n: 'Financial Accounting', cr: 4 }, { c: 'ACC 116', n: 'Managerial Accounting', cr: 4 }, { c: 'ECON 101', n: 'Economics', cr: 3 }] },
    { o: 'Macomb', t: 'OU', m: 'BIO', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'BIOL 101', n: 'General Biology I', cr: 4 }, { c: 'BIOL 102', n: 'General Biology II', cr: 4 }, { c: 'CHEM 101', n: 'Chemistry I', cr: 4 }, { c: 'MATH 155', n: 'Calculus I', cr: 4 }] },
    // Schoolcraft → Oakland University (3 majors)
    { o: 'Schoolcraft', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'MATH 183', n: 'Calculus I', cr: 4 }, { c: 'MATH 184', n: 'Calculus II', cr: 4 }, { c: 'CS 101', n: 'Intro to Programming', cr: 3 }, { c: 'CS 201', n: 'Data Structures', cr: 3 }] },
    { o: 'Schoolcraft', t: 'OU', m: 'BUS', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'ACC 101', n: 'Accounting I', cr: 3 }, { c: 'ACC 102', n: 'Accounting II', cr: 3 }, { c: 'ECO 201', n: 'Economics I', cr: 3 }, { c: 'ECO 202', n: 'Economics II', cr: 3 }] },
    { o: 'Schoolcraft', t: 'OU', m: 'BIO', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'BIO 111', n: 'General Biology I', cr: 4 }, { c: 'BIO 112', n: 'General Biology II', cr: 4 }, { c: 'CHEM 111', n: 'Chemistry I', cr: 4 }, { c: 'MATH 183', n: 'Calculus I', cr: 4 }] },
    // Henry Ford → Oakland University
    { o: 'HenryFord', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'MTH 160', n: 'Calculus I', cr: 4 }, { c: 'MTH 161', n: 'Calculus II', cr: 4 }, { c: 'CS 111', n: 'Computer Science I', cr: 4 }, { c: 'CS 121', n: 'Computer Science II', cr: 4 }] },
    // WCCCD → Oakland University
    { o: 'WCCCD', t: 'OU', m: 'CS', r: 'GPA >= 2.5', a: 2.8, c: [{ c: 'MTH 161', n: 'Calculus I', cr: 4 }, { c: 'MTH 162', n: 'Calculus II', cr: 4 }, { c: 'CS 101', n: 'Computer Science I', cr: 3 }, { c: 'CS 102', n: 'Computer Science II', cr: 3 }] },
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
