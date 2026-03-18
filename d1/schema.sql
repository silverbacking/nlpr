CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Default admin user (password: admin123)
-- The password hash below is SHA-256( "nlpr-salt:" + "admin123" ) encoded as hex.
-- In production, each user gets a unique random salt stored alongside the hash.
-- For the seed we use the app-level salt prefix so the login endpoint can verify it.
--
-- Seed is applied via: wrangler d1 execute nlpr-db --file=./d1/schema.sql
-- Then run the seed separately or use the register endpoint to create the first admin.
