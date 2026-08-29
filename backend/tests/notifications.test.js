const request = require('supertest');
const app = require('../app');
const { prismaMock, users, authAs, resetMocks } = require('./helpers');

beforeEach(resetMocks);

describe('GET /api/notifications', () => {
  it('requires ADMIN or CEO role', async () => {
    const res = await request(app).get('/api/notifications').set(authAs(users.staff));
    expect(res.status).toBe(403);
  });

  it('returns notifications for admins', async () => {
    const headers = authAs(users.admin);
    prismaMock.notification.findMany.mockResolvedValueOnce([{ id: 'n-1' }, { id: 'n-2' }]);
    const res = await request(app).get('/api/notifications').set(headers);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /api/notifications/unread-count', () => {
  it('returns the unread count', async () => {
    const headers = authAs(users.ceo);
    prismaMock.notification.count.mockResolvedValueOnce(7);
    const res = await request(app).get('/api/notifications/unread-count').set(headers);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 7 });
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  it('marks a notification as read', async () => {
    const headers = authAs(users.admin);
    prismaMock.notification.update.mockImplementationOnce(async ({ where, data }) => ({ id: where.id, ...data }));
    const res = await request(app).patch('/api/notifications/n-1/read').set(headers);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'n-1', isRead: true });
  });
});

describe('PATCH /api/notifications/read-all', () => {
  it('marks all notifications as read', async () => {
    const headers = authAs(users.admin);
    prismaMock.notification.updateMany.mockResolvedValueOnce({ count: 3 });
    const res = await request(app).patch('/api/notifications/read-all').set(headers);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/marked as read/i);
    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
      where: { isRead: false },
      data: { isRead: true }
    });
  });
});
