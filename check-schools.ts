import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const schools = await prisma.school.findMany({ orderBy: { code: 'asc' } })
  console.log('=== Current Schools & Tuition ===')
  schools.forEach(s => {
    console.log(`\n${s.code} (${s.type}):`)
    console.log(`  In-State: $${s.inStatePerCredit}`)
    console.log(`  Out-State: $${s.outStatePerCredit}`)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())