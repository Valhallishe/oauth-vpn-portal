import Database from 'better-sqlite3'

// Both tables live on persistent storage. Never put this database in the image.
export const database = new Database(process.env.DATABASE_PATH || 'auth-db.sqlite')
database.pragma('journal_mode = WAL')
database.exec(`CREATE TABLE IF NOT EXISTS vpn_bindings (
  user_id TEXT PRIMARY KEY,
  remnawave_id INTEGER UNIQUE,
  pending_username TEXT UNIQUE
)`)
