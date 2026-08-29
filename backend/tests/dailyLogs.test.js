const request = require('supertest');
const app = require('../app');
const { prismaMock, users, authAs, resetMocks } = require('./helpers');

beforeEach(resetMocks);

describe('GET /api/logs', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/logs');
    expect(res.status).toBe(401);
  });

  it('returns logs for any authenticated user', async () => {
    const headers = authAs(users.field);
    prismaMock.dailyLog.findMany.mockResolvedValueOnce([{ id: 'log-1', production: 100 }]);
    const res = await request(app).get('/api/logs').set(headers);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('POST /api/logs', () => {
  it('is forbidden for field managers', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set(authAs(users.field))
      .send({ openingStock: 10, production: 100, dispatch: 50 });
    expect(res.status).toBe(403);
  });

  it('rejects negative quantities', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set(authAs(users.supervisor))
      .send({ openingStock: -5, production: 100, dispatch: 50 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/non-negative integers/i);
  });

  it('rejects non-integer quantities', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set(authAs(users.supervisor))
      .send({ openingStock: 10, production: 10.5, dispatch: 5 });
    expect(res.status).toBe(400);
  });

  it('creates a log and computes stock totals', async () => {
    const headers = authAs(users.supervisor);
    prismaMock.dailyLog.create.mockImplementationOnce(async ({ data }) => ({ id: 'log-1', ...data }));
    prismaMock.notification.create.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/logs')
      .set(headers)
      .send({ openingStock: 10, production: 100, dispatch: 40 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ totalInStock: 110, remainingStock: 70 });
  });

  it('returns 400 when a log for today already exists', async () => {
    const headers = authAs(users.supervisor);
    prismaMock.dailyLog.create.mockRejectedValueOnce({ code: 'P2002' });

    const res = await request(app)
      .post('/api/logs')
      .set(headers)
      .send({ openingStock: 10, production: 100, dispatch: 40 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

describe('PUT /api/logs/:id', () => {
  it('returns 404 for missing logs', async () => {
    const headers = authAs(users.supervisor);
    prismaMock.dailyLog.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).put('/api/logs/nope').set(headers).send({ production: 5 });
    expect(res.status).toBe(404);
  });

  it('refuses to modify locked logs', async () => {
    const headers = authAs(users.supervisor);
    prismaMock.dailyLog.findUnique.mockResolvedValueOnce({ id: 'log-1', isLocked: true });
    const res = await request(app).put('/api/logs/log-1').set(headers).send({ production: 5 });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/locked/i);
  });

  it('recomputes totals using existing values for omitted fields', async () => {
    const headers = authAs(users.supervisor);
    prismaMock.dailyLog.findUnique.mockResolvedValueOnce({
      id: 'log-1', isLocked: false, openingStock: 10, production: 100, dispatch: 40, date: new Date()
    });
    prismaMock.dailyLog.update.mockImplementationOnce(async ({ data }) => ({ id: 'log-1', ...data }));
    prismaMock.notification.create.mockResolvedValueOnce({});

    const res = await request(app).put('/api/logs/log-1').set(headers).send({ dispatch: 60 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ totalInStock: 110, remainingStock: 50 });
  });
});

describe('PATCH /api/logs/:id/lock', () => {
  it('toggles the lock state', async () => {
    const headers = authAs(users.admin);
    prismaMock.dailyLog.findUnique.mockResolvedValueOnce({ id: 'log-1', isLocked: false, date: new Date() });
    prismaMock.dailyLog.update.mockImplementationOnce(async ({ data }) => ({ id: 'log-1', ...data }));
    prismaMock.notification.create.mockResolvedValueOnce({});

    const res = await request(app).patch('/api/logs/log-1/lock').set(headers);
    expect(res.status).toBe(200);
    expect(res.body.isLocked).toBe(true);
  });

  it('is forbidden for staff', async () => {
    const res = await request(app).patch('/api/logs/log-1/lock').set(authAs(users.staff));
    expect(res.status).toBe(403);
  });
});

describe('GET /api/logs/production-stats', () => {
  it('aggregates weekly and monthly production', async () => {
    const headers = authAs(users.supervisor);
    const logs = [
      { date: new Date(), production: 100, dispatch: 80, remainingStock: 20 },
      { date: new Date(), production: 50, dispatch: 30, remainingStock: 40 }
    ];
    prismaMock.dailyLog.findMany
      .mockResolvedValueOnce(logs)
      .mockResolvedValueOnce(logs);

    const res = await request(app).get('/api/logs/production-stats').set(headers);
    expect(res.status).toBe(200);
    expect(res.body.weekly).toEqual({ production: 150, dispatch: 110 });
    expect(res.body.monthly).toEqual({ production: 150, dispatch: 110 });
    expect(res.body.currentStock).toBe(40);
  });
});
