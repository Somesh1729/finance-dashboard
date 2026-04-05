process.env.NODE_ENV  = 'test';
process.env.DB_PATH   = ':memory:';
process.env.JWT_SECRET = 'test_jwt_secret';

const { initializeDatabase } = require('../src/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../src/config/database');

function setupTestDb() {
  initializeDatabase();
}

async function seedTestUsers() {
  const db = getDb();
  const password = await bcrypt.hash('password123', 10);

  const admin   = { id: uuidv4(), name: 'Admin User',   email: 'admin@test.com',   role: 'admin'   };
  const analyst = { id: uuidv4(), name: 'Analyst User', email: 'analyst@test.com', role: 'analyst' };
  const viewer  = { id: uuidv4(), name: 'Viewer User',  email: 'viewer@test.com',  role: 'viewer'  };

  const insert = db.prepare(`
    INSERT INTO users (id, name, email, password, role, status)
    VALUES (@id, @name, @email, @password, @role, 'active')
  `);

  [admin, analyst, viewer].forEach(u => insert.run({ ...u, password }));
  return { admin, analyst, viewer, password: 'password123' };
}

function clearDb() {
  const db = getDb();
  db.exec('DELETE FROM financial_records; DELETE FROM users;');
}

module.exports = { setupTestDb, seedTestUsers, clearDb };