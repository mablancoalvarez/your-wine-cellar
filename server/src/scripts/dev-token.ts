import { ensureCellars, issueTokens, toPublicUser } from '../auth.js';
import { prisma } from '../db.js';

const email = 'dev@cellar.local';

try {
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: 'Dev',
      googleSub: 'dev-local',
    },
    update: {},
  });

  await ensureCellars(user.id);
  const tokens = await issueTokens(user.id, user.email);
  const cellars = await prisma.cellar.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, kind: true },
  });

  console.log(
    JSON.stringify(
      {
        user: toPublicUser(user),
        ...tokens,
        cellars,
      },
      null,
      2,
    ),
  );
} finally {
  await prisma.$disconnect();
}
