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

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sdkwater.com' },
    update: {},
    create: {
      email: 'admin@sdkwater.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@sdkwater.com' },
    update: {},
    create: {
      email: 'supervisor@sdkwater.com',
      name: 'Factory Supervisor',
      password: hashedPassword,
      role: 'FACTORY_SUPERVISOR',
    },
  });

  const fieldManager = await prisma.user.upsert({
    where: { email: 'field@sdkwater.com' },
    update: {},
    create: {
      email: 'field@sdkwater.com',
      name: 'Field Manager',
      password: hashedPassword,
      role: 'FIELD_MANAGER',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@sdkwater.com' },
    update: {},
    create: {
      email: 'staff@sdkwater.com',
      name: 'Staff Member',
      password: hashedPassword,
      role: 'STAFF',
    },
  });

  console.log('Seeded users:', { ceo, admin, supervisor, fieldManager, staff });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
