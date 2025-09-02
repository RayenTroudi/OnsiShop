import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const content = await prisma.siteContent.findMany();
  console.log('Site Content:', content);
  await prisma.$disconnect();
}

main();
