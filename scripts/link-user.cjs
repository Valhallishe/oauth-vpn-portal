// Run locally as the service account. The account must have signed into the overview first.
const Database = require('better-sqlite3')
const [email, uuid] = process.argv.slice(2)
if (!email || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid || '')) {
  console.error('Usage: node scripts/link-user.cjs EMAIL REMNAWAVE_UUID')
  process.exit(2)
}
const db = new Database(process.env.DATABASE_PATH || 'auth-db.sqlite')
const users = db.prepare('SELECT id FROM user WHERE lower(email) = lower(?)').all(email)
if (users.length !== 1) throw new Error('Expected one signed-in account with this email')
const existing = db.prepare('SELECT remnawave_uuid, pending_username FROM vpn_bindings WHERE user_id = ?').get(users[0].id)
if (existing) throw new Error('A binding already exists; resolve it manually to avoid losing a subscription')
db.prepare('INSERT INTO vpn_bindings (user_id, remnawave_uuid) VALUES (?, ?)').run(users[0].id, uuid)
console.log('Binding saved')
