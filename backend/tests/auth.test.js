const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const { prismaMock, users, authAs, tokenFor, resetMocks } = require('./helpers');

beforeEach(resetMocks);

describe('POST /api/auth/login', () => {
  it('returns 400 when email or password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it('returns 401 for unknown user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@sdkwater.com', password: 'whatever1' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it('returns 401 for wrong password', async () => {
    const hashed = await bcrypt.hash('correct-password', 10);
    prismaMock.user.findUnique.mockResolvedValueOnce({ ...users.admin, password: hashed });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: users.admin.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('returns user info and token for valid credentials', async () => {
    const hashed = await bcrypt.hash('admin123', 10);
    prismaMock.user.findUnique.mockResolvedValueOnce({ ...users.admin, password: hashed });
    prismaMock.user.update.mockResolvedValueOnce({ ...users.admin });
    prismaMock.notification.create.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: users.admin.email, password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: users.admin.id,
      email: users.admin.email,
      role: 'ADMIN'
    });
    expect(typeof res.body.token).toBe('string');
    expect(res.body).not.toHaveProperty('password');
  });
});

describe('POST /api/auth/register', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(401);
  });

  it('rejects tokens that fail verification', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', 'Bearer not-a-real-token')
      .send({});
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token failed/i);
  });

  it('forbids non-admin roles', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set(authAs(users.staff))
      .send({ name: 'X', email: 'x@y.com', password: 'password123' });
    expect(res.status).toBe(403);
  });

  it('validates required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set(authAs(users.ceo))
      .send({ name: 'X' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set(authAs(users.ceo))
      .send({ name: 'X', email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid email/i);
  });

  it('rejects short passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set(authAs(users.ceo))
      .send({ name: 'X', email: 'x@y.com', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/8 characters/i);
  });

  it('rejects invalid roles', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set(authAs(users.ceo))
      .send({ name: 'X', email: 'x@y.com', password: 'password123', role: 'SUPERUSER' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid role/i);
  });

  it('rejects duplicate emails', async () => {
    const headers = authAs(users.ceo);
    prismaMock.user.findUnique.mockResolvedValueOnce(users.staff);
    const res = await request(app)
      .post('/api/auth/register')
      .set(headers)
      .send({ name: 'X', email: users.staff.email, password: 'password123', role: 'STAFF' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('creates a user and omits the password in the response', async () => {
    const headers = authAs(users.ceo);
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({
      id: 'new-id', name: 'New User', email: 'new@sdkwater.com', role: 'STAFF', password: 'hashed'
    });
    prismaMock.notification.create.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/auth/register')
      .set(headers)
      .send({ name: 'New User', email: 'new@sdkwater.com', password: 'password123', role: 'STAFF' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 'new-id', name: 'New User', email: 'new@sdkwater.com', role: 'STAFF' });
  });
});

describe('GET /api/auth/users', () => {
  it('returns 401 when the token user no longer exists', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${tokenFor(users.admin)}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/user not found/i);
  });

  it('returns the user list for admins', async () => {
    const headers = authAs(users.admin);
    prismaMock.user.findMany.mockResolvedValueOnce([users.admin, users.staff]);
    const res = await request(app).get('/api/auth/users').set(headers);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('is forbidden for staff', async () => {
    const res = await request(app).get('/api/auth/users').set(authAs(users.staff));
    expect(res.status).toBe(403);
  });
});
