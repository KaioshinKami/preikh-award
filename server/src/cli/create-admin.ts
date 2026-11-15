// Grants the admin role to an already registered user:
//   npm run create-admin -- you@example.com
// Admin rights are never derived from an email address, because emails are not confirmed.
import { requireEnv } from '../config.ts';
import { createSql } from '../db/sql.ts';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error('Usage: npm run create-admin -- <email of a registered user>');
  process.exit(1);
}

const sql = createSql(requireEnv('DATABASE_URL'));
const [user] = await sql<{ name: string }[]>`
  update users set role = 'admin' where email = ${email} returning name
`;
await sql.end();

if (!user) {
  console.error(
    `No user with email ${email}. Register on the site first, then run this command again.`,
  );
  process.exit(1);
}

console.log(`${user.name} (${email}) is now an admin.`);
