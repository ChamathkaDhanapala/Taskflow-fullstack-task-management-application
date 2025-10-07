import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  await prisma.task.createMany({
    data: [
      { title: 'Learn React', priority: 'high' },
      { title: 'Build Task Manager', priority: 'medium' },
      { title: 'Deploy to Vercel', priority: 'low', completed: true },
    ]
  });
  
  console.log('✅ Database seeded!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());