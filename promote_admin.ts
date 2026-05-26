import { config } from 'dotenv';
config();

import { db } from './src/lib/db';

async function main() {
  const users = await db.user.findMany();
  if (users.length === 0) {
    console.log("No users found to promote.");
    return;
  }
  
  for (const user of users) {
    await db.user.update({
      where: { id: user.id },
      data: { role: 'SUPER_ADMIN' }
    });
    console.log(`Promoted user ${user.email} to SUPER_ADMIN`);
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0);
  });
