import { prisma } from '../lib/prisma.js';
import { addDays, setHours, setMinutes } from 'date-fns';

async function seed() {
  await prisma.task.deleteMany({});

  const now = new Date();

  const tasks = [
    {
      title: 'Book movie tickets',
      description: 'Friday evening show with friends',
      dueDate: setMinutes(setHours(addDays(now, 2), 19), 30),
      priority: 'MEDIUM' as const,
      status: 'OPEN' as const,
    },
    {
      title: 'Buy groceries',
      description: 'Milk, eggs, bread and veggies',
      dueDate: setMinutes(setHours(now, 18), 0),
      priority: 'HIGH' as const,
      status: 'COMPLETED' as const,
    },
    {
      title: 'Call home',
      description: 'Catch up with mom and dad',
      dueDate: setMinutes(setHours(now, 20), 0),
      priority: 'LOW' as const,
      status: 'COMPLETED' as const,
    },
    {
      title: 'Pick up laundry',
      description: 'Suits and jackets from the cleaner',
      dueDate: setMinutes(setHours(addDays(now, 1), 17), 30),
      priority: 'MEDIUM' as const,
      status: 'IN_PROGRESS' as const,
    },
    {
      title: 'Pay wifi bill',
      description: 'Check broadband account before due date',
      dueDate: setMinutes(setHours(addDays(now, 3), 11), 0),
      priority: 'HIGH' as const,
      status: 'OPEN' as const,
    },
  ];

  for (const item of tasks) {
    await prisma.task.create({ data: item });
  }

  console.log(`Seeded ${tasks.length} tasks.`);
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
