const request = require('supertest');
const app = require('../src/app');
const { setupTestDb, seedTestUsers, clearDb } = require('./helpers');

let adminToken, viewerToken, analystToken;

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

  adminToken   = await loginAs('admin@test.com');
  viewerToken  = await loginAs('viewer@test.com');
  analystToken = await loginAs('analyst@test.com');
});

const makeRecord = (overrides = {}) => ({
  amount:   1500.50,
  type:     'income',
  category: 'Salary',
  date:     '2024-06-15',
  notes:    'Monthly salary',
  ...overrides,
});

describe('POST /api/records', () => {
  it('allows admin to create a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(makeRecord());

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(1500.50);
    expect(res.body.data.type).toBe('income');
  });

  it('returns 403 for viewer attempting to create', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send(makeRecord());

    expect(res.status).toBe(403);
  });

  it('returns 403 for analyst attempting to create', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(makeRecord());

    expect(res.status).toBe(403);
  });

  it('returns 400 for negative amount', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(makeRecord({ amount: -100 }));

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid type', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(makeRecord({ type: 'transfer' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid date format', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(makeRecord({ date: '15-06-2024' }));

    expect(res.status).toBe(400);
  });
});

describe('GET /api/records', () => {
  beforeEach(async () => {
    // Seed some records
    await request(app).post('/api/records').set('Authorization', `Bearer ${adminToken}`).send(makeRecord({ type: 'income',  category: 'Salary',   amount: 3000, date: '2024-06-01' }));
    await request(app).post('/api/records').set('Authorization', `Bearer ${adminToken}`).send(makeRecord({ type: 'expense', category: 'Rent',     amount: 1000, date: '2024-06-02' }));
    await request(app).post('/api/records').set('Authorization', `Bearer ${adminToken}`).send(makeRecord({ type: 'expense', category: 'Utilities', amount:  200, date: '2024-06-03' }));
  });

  it('allows viewer to list records', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
  });

  it('filters by type', async () => {
    const res = await request(app)
      .get('/api/records?type=expense')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    res.body.data.forEach(r => expect(r.type).toBe('expense'));
  });

  it('filters by category', async () => {
    const res = await request(app)
      .get('/api/records?category=Rent')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    res.body.data.forEach(r => expect(r.category).toBe('Rent'));
  });

  it('supports pagination', async () => {
    const res = await request(app)
      .get('/api/records?page=1&limit=2')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.pagination.limit).toBe(2);
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/records');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/records/:id', () => {
  let recordId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(makeRecord());
    recordId = res.body.data.id;
  });

  it('admin can update a record', async () => {
    const res = await request(app)
      .patch(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 2000, notes: 'Updated note' });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(2000);
    expect(res.body.data.notes).toBe('Updated note');
  });

  it('viewer cannot update a record', async () => {
    const res = await request(app)
      .patch(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 9999 });

    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent record', async () => {
    const res = await request(app)
      .patch('/api/records/non-existent-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 500 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/records/:id', () => {
  let recordId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(makeRecord());
    recordId = res.body.data.id;
  });

  it('admin can soft-delete a record', async () => {
    const res = await request(app)
      .delete(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getRes.status).toBe(404);
  });

  it('viewer cannot delete a record', async () => {
    const res = await request(app)
      .delete(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });
});