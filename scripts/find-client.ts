
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const clients = await prisma.crmClient.findMany({
    where: {
      OR: [
        { companyName: { contains: 'ballo', mode: 'insensitive' } },
        { companyName: { contains: 'george', mode: 'insensitive' } },
      ]
    }
  })
  console.log('Found clients:', JSON.stringify(clients, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
