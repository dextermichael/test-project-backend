const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Hash the password for admin user
  const hashedPassword = await bcrypt.hash('admin_password', 10);

  // Create the Admin role
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      permissions: {
        create: [
          { module: 'User Management' },
          { module: 'Role Management' }
        ]
      }
    }
  });

  // Create the Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      phone_no: '1234567890',
      password: hashedPassword,
      roleId: adminRole.id
    }
  });

  console.log('Seeded admin role and admin user');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
