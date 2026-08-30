import { prisma } from './src/config/database';

async function check() {
  const count = await prisma.vehicle.count();
  console.log("Total vehicles:", count);
  const vehicles = await prisma.vehicle.findMany({ select: { slug: true }});
  console.log("Slugs:", vehicles.map(v => v.slug));
  await prisma.$disconnect();
}

check().catch(console.error);
