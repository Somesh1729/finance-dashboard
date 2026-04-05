require('dotenv').config();
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');
const {initializeDatabase, getDb} = require('./database');

async function seed(){
  initializeDatabase();
  const db = getDb();

  console.log('Seeding database with initial data...');

  db.exec(`
    DELETE FROM financial_records;
    DELETE FROM users;
  `);

  const password =   await bcrypt.hash('password123', 10);

  const users = [
        { id: uuidv4(), name: 'Ambi Admin',   email: 'admin@finance.com',   role: 'admin'   },
    { id: uuidv4(), name: 'Anil Analyst',   email: 'analyst@finance.com', role: 'analyst' },
    { id: uuidv4(), name: 'Vic Viewer', email: 'viewer@finance.com',  role: 'viewer'  },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role) 
    VALUES (@id, @name, @email, @password, @role)
  `);

  for(const user of users){
    insertUser.run({
      ...user,     password
    });
  }

  const adminId = users[0].id;

  const categories = ['Salary', 'Freelance', 'Rent', 'Utilities', 'Food', 'Transport', 'Health'];

  const types = ['income', 'expense'];

  const insertRecord = db.prepare(`
    INSERT INTO financial_records (id, amount, type, category, date, notes, created_by) 
    VALUES (@id, @amount, @type, @category, @date, @notes, @created_by)
  `);

  const seedRecords = db.trasanction(()=>{
    for(let i = 0 ; i < 30 ; i++){
      const type = types[i%2];
      const category = type === 'income' ? categories[i%2] : categories[2 + (i%5)];

      const date  = new Date();
      date.setDate(date.getDate() - i*3);
      
      insertRecord.run({
        id: uuidv4(),
        amount: parseFloat((Math.random()*5000+100).toFixed(2)),
        type,
        category,
        date: date.toISOString().split('T')[0],
        notes: `Auto-seeded record #${i+1}`,
        created_by: adminId
      });
    }
  });

  seedRecords();
  console.log('Database seeding completed successfully!');
  console.log('\n Login credentials (all passwords: password123)');
  console.log('  admin@finance.com   → admin');
  console.log('  analyst@finance.com → analyst');
  console.log('  viewer@finance.com  → viewer');
}

seed().catch(console.error);