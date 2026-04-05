const request = require('supertest');
const app = require('../src/app');
const { setupTestDb, seedTestUsers, clearDb } = require('./helpers');

let adminToken, viewerToken;

beforeAll(() => setupTestDb());

beforeEach(async () => {
  clearDb();
  await seedTestUsers();

  const loginAs = async (email) => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'password123' });
    return res.body.data.token;
  };

  adminToken  = await loginAs('admin@test.com');
  viewerToken = await loginAs('viewer@test.com');

  const records = [
    { amount: 5000, type: 'income',  category: 'Salary',    date: '2024-06-01' },
    { amount: 1000, type: 'expense', category: 'Rent',      date: '2024-06-02' },
    { amount:  200, type: 'expense', category: 'Utilities', date: '2024-06-03' },
    { amount: 3000, type: 'income',  category: 'Freelance', date: '2024-05-15' },
    { amount:  500, type: 'expense', category: 'Food',      date: '2024-05-20' },
  ];

  for (const rec of records) {
    await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...rec, notes: 'test' });
  }
});

describe('GET /api/dashboard', () => {
  it('returns full dashboard payload for viewer', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('summary');
    expect(res.body.data).toHaveProperty('category_breakdown');
    expect(res.body.data).toHaveProperty('monthly_trends');
    expect(res.body.data).toHaveProperty('recent_activity');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/dashboard/summary', () => {
  it('returns correct income and expense totals', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.total_income).toBe(8000);  
    expect(res.body.data.total_expense).toBe(1700);  
    expect(res.body.data.net_balance).toBe(6300);    
  });

  it('supports date range filtering', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?startDate=2024-06-01&endDate=2024-06-30')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.total_income).toBe(5000);  
    expect(res.body.data.total_expense).toBe(1200); 
  });
});

describe('GET /api/dashboard/categories', () => {
  it('returns category breakdown grouped by type', async () => {
    const res = await request(app)
      .get('/api/dashboard/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('income');
    expect(res.body.data).toHaveProperty('expense');
    expect(Array.isArray(res.body.data.income)).toBe(true);
    expect(Array.isArray(res.body.data.expense)).toBe(true);
  });
});

describe('GET /api/dashboard/trends', () => {
  it('returns monthly trend data', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends?months=6')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toHaveProperty('month');
    }
  });
});

describe('GET /api/dashboard/recent', () => {
  it('returns recent activity records', async () => {
    const res = await request(app)
      .get('/api/dashboard/recent?limit=3')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
  });
});