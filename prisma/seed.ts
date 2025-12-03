import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@balloads.com' },
    update: {},
    create: {
      email: 'admin@balloads.com',
      password: process.env.ADMIN_PASSWORD || 'admin123', // Change this!
    },
  })

  console.log('Seeded admin user:', adminUser.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

