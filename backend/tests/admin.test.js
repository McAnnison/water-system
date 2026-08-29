const request = require('supertest');
const app = require('../app');
const { prismaMock, users, authAs, resetMocks } = require('./helpers');

beforeEach(resetMocks);

describe('GET /api/admin/stats', () => {
  it('requires ADMIN or CEO role', async () => {
    const res = await request(app).get('/api/admin/stats').set(authAs(users.supervisor));
    expect(res.status).toBe(403);
  });

  it('computes financial summary from transactions', async () => {
    const headers = authAs(users.ceo);
    const transactions = [
      { type: 'INCOME', amount: '1000', date: new Date() },
      { type: 'INCOME', amount: '500', date: new Date() },
      { type: 'EXPENSE', amount: '300', date: new Date() }
    ];
    prismaMock.transaction.findMany
      .mockResolvedValueOnce(transactions)
      .mockResolvedValueOnce(transactions);
    prismaMock.user.count.mockResolvedValueOnce(5).mockResolvedValueOnce(4);
    prismaMock.dailyLog.findMany.mockResolvedValueOnce([
      { date: new Date(), production: 100, dispatch: 60, remainingStock: 40 }
    ]);
    prismaMock.notification.findMany.mockResolvedValueOnce([]);
    prismaMock.notification.count.mockResolvedValueOnce(2);

    const res = await request(app).get('/api/admin/stats').set(headers);
    expect(res.status).toBe(200);
    expect(res.body.summary).toMatchObject({
      totalIncome: 1500,
      totalExpenses: 300,
      netProfit: 1200,
      totalUsers: 5,
      activeUsers: 4,
      totalProduction: 100,
      totalDispatch: 60
    });
    expect(res.body.unreadNotifications).toBe(2);
  });
});

describe('GET /api/admin/ai-insights', () => {
  it('returns insights and metrics', async () => {
    const headers = authAs(users.admin);
    prismaMock.transaction.findMany
      .mockResolvedValueOnce([
        { type: 'INCOME', amount: '2000', category: 'Sales', date: new Date() },
        { type: 'EXPENSE', amount: '500', category: 'Fuel', date: new Date() }
      ])
      .mockResolvedValueOnce([
        { type: 'INCOME', amount: '1000', category: 'Sales', date: new Date() }
      ]);
    prismaMock.dailyLog.findMany.mockResolvedValueOnce([
      { date: new Date(), production: 100, dispatch: 80, remainingStock: 20 }
    ]);

    const res = await request(app).get('/api/admin/ai-insights').set(headers);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.insights)).toBe(true);
    expect(res.body.insights.length).toBeGreaterThan(0);
    expect(res.body.metrics).toMatchObject({
      currentIncome: 2000,
      currentExpenses: 500,
      previousIncome: 1000,
      revenueChange: 100
    });
  });
});

describe('GET /api/admin/transactions', () => {
  it('passes type and date filters to the query', async () => {
    const headers = authAs(users.admin);
    prismaMock.transaction.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/admin/transactions?type=INCOME&startDate=2026-01-01&endDate=2026-01-31')
      .set(headers);

    expect(res.status).toBe(200);
    const where = prismaMock.transaction.findMany.mock.calls[0][0].where;
    expect(where.type).toBe('INCOME');
    expect(where.date.gte).toEqual(new Date('2026-01-01'));
    expect(where.date.lte).toEqual(new Date('2026-01-31'));
  });
});

describe('POST /api/admin/transactions', () => {
  it('validates required fields', async () => {
    const res = await request(app)
      .post('/api/admin/transactions')
      .set(authAs(users.admin))
      .send({ type: 'INCOME' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it('rejects invalid transaction types', async () => {
    const res = await request(app)
      .post('/api/admin/transactions')
      .set(authAs(users.admin))
      .send({ type: 'TRANSFER', amount: 100, category: 'Misc' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/INCOME or EXPENSE/);
  });

  it('rejects non-positive amounts', async () => {
    const res = await request(app)
      .post('/api/admin/transactions')
      .set(authAs(users.admin))
      .send({ type: 'INCOME', amount: -5, category: 'Sales' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/positive number/i);
  });

  it('creates a transaction for admins', async () => {
    const headers = authAs(users.admin);
    prismaMock.transaction.create.mockImplementationOnce(async ({ data }) => ({ id: 'tx-1', ...data }));
    prismaMock.notification.create.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/admin/transactions')
      .set(headers)
      .send({ type: 'INCOME', amount: '250.50', category: 'Sales', description: 'Bulk order' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ type: 'INCOME', amount: 250.5, category: 'Sales', adminId: users.admin.id });
  });

  it('is forbidden for staff', async () => {
    const res = await request(app)
      .post('/api/admin/transactions')
      .set(authAs(users.staff))
      .send({ type: 'INCOME', amount: 100, category: 'Sales' });
    expect(res.status).toBe(403);
  });
});
