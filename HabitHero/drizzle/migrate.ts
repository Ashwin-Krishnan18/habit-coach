import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../server/db';

// This script will run all migrations in the 'drizzle' folder
async function main() {
  console.log('Migration started...');
  await migrate(db, { migrationsFolder: 'migrations' });
  console.log('Migration completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});