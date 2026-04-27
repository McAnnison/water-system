const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const ceo = await prisma.user.upsert({
    where: { email: 'ceo@sdkwater.com' },
    update: {},
    create: {
      email: 'ceo@sdkwater.com',
      name: 'Main CEO',
      password: hashedPassword,
      role: 'CEO',
    },
  });

  console.log({ ceo });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());