const request = require('supertest');
const app = require('../src/app');
const { setupTestDb, seedTestUsers, clearDb } = require('./helpers');

let adminToken, viewerToken, viewerId;

beforeAll(() => setupTestDb());

beforeEach(async () => {
  clearDb();
  const users = await seedTestUsers();

  const loginAs = async (email) => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'password123' });
    return res.body.data.token;
  };

  adminToken  = await loginAs('admin@test.com');
  viewerToken = await loginAs('viewer@test.com');
  viewerId    = users.viewer.id;
});

describe('GET /api/users', () => {
  it('admin can list all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(3);
  });

  it('viewer cannot list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });
});

describe('POST /api/users', () => {
  it('admin can create a user with a specific role', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Analyst', email: 'newanalyst@test.com', password: 'password123', role: 'analyst' });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('analyst');
  });

  it('returns 409 for duplicate email', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Dup', email: 'viewer@test.com', password: 'password123', role: 'viewer' });

    expect(res.status).toBe(409);
  });
});

describe('PATCH /api/users/:id', () => {
  it('admin can update user role', async () => {
    const res = await request(app)
      .patch(`/api/users/${viewerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'analyst' });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('analyst');
  });

  it('admin can deactivate a user', async () => {
    const res = await request(app)
      .patch(`/api/users/${viewerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('inactive');
  });

  it('returns 404 for unknown user id', async () => {
    const res = await request(app)
      .patch('/api/users/non-existent-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'analyst' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/users/:id', () => {
  it('admin can delete a user', async () => {
    const res = await request(app)
      .delete(`/api/users/${viewerId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/users/${viewerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getRes.status).toBe(404);
  });

  it('admin cannot delete their own account', async () => {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    const adminId = meRes.body.data.id;

    const res = await request(app)
      .delete(`/api/users/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});