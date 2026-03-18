CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Default admin user (password: admin123)
INSERT OR IGNORE INTO users (email, password_hash, name, role)
VALUES ('admin@silverbacking.com', 'h_admin123_8', 'Admin', 'admin');
