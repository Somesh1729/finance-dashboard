const Database = require('better-sqlite3');
const path = require('path');

let _db = null;

function getDb() {
  if (!_db) {
    _db = new Database(path.resolve(process.env.DB_PATH || './finance.db'));
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
  }
  return _db;
}

function initializeDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      password    TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'viewer',
      status      TEXT NOT NULL DEFAULT 'active',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS financial_records (
      id          TEXT PRIMARY KEY,
      amount      REAL NOT NULL CHECK(amount > 0),
      type        TEXT NOT NULL CHECK(type IN ('income','expense')),
      category    TEXT NOT NULL,
      date        TEXT NOT NULL,
      notes       TEXT,
      created_by  TEXT NOT NULL REFERENCES users(id),
      deleted_at  TEXT DEFAULT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_records_type
      ON financial_records(type);

    CREATE INDEX IF NOT EXISTS idx_records_category
      ON financial_records(category);

    CREATE INDEX IF NOT EXISTS idx_records_date
      ON financial_records(date);

    CREATE INDEX IF NOT EXISTS idx_records_deleted
      ON financial_records(deleted_at);
  `);

  return db;
}

module.exports = { getDb, initializeDatabase };