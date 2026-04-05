require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { initializeDatabase, getDb } = require('./database');

async function seed() {
  initializeDatabase();
  const db = getDb();

  console.log(' Seeding database...');

  db.exec(`DELETE FROM financial_records; DELETE FROM users;`);

  const password = await bcrypt.hash('password123', 10);

  const users = [
    { id: uuidv4(), name: 'Ambi Admin',   email: 'admin@finance.com',   role: 'admin'   },
    { id: uuidv4(), name: 'Ana Analyst',   email: 'analyst@finance.com', role: 'analyst' },
    { id: uuidv4(), name: 'Victor Viewer', email: 'viewer@finance.com',  role: 'viewer'  },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, status)
    VALUES (@id, @name, @email, @password, @role, 'active')
  `);

  for (const user of users) {
    insertUser.run({ ...user, password });
  }

  console.log('Users created');

  const adminId = users[0].id;

  const categories = {
    income:  ['Salary', 'Freelance', 'Investment', 'Bonus'],
    expense: ['Rent', 'Utilities', 'Food', 'Transport', 'Health'],
  };

  const insertRecord = db.prepare(`
    INSERT INTO financial_records (id, amount, type, category, date, notes, created_by)
    VALUES (@id, @amount, @type, @category, @date, @notes, @created_by)
  `);

  const seedRecords = db.transaction(() => {
    for (let i = 0; i < 30; i++) {
      const type     = i % 2 === 0 ? 'income' : 'expense';
      const catList  = categories[type];
      const category = catList[i % catList.length];

      const date = new Date();
      date.setDate(date.getDate() - (i * 3));

      insertRecord.run({
        id:         uuidv4(),
        amount:     parseFloat((Math.random() * 4900 + 100).toFixed(2)),
        type,
        category,
        date:       date.toISOString().split('T')[0],
        notes:      `Seeded record #${i + 1}`,
        created_by: adminId,
      });
    }
  });

  seedRecords();

  console.log(' 30 financial records created');
  console.log('\nTest credentials (password: password123)');
  console.log('   admin@finance.com   → full access');
  console.log('   analyst@finance.com → read + insights');
  console.log('   viewer@finance.com  → read only');
}

seed().catch(console.error);