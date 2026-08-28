const request = require('supertest');
const app = require('../app');
const { resetMocks } = require('./helpers');

beforeEach(resetMocks);

describe('App basics', () => {
  it('GET / returns API running message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/running/i);
  });

  it('GET /health returns ok status with uptime', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('unknown routes return JSON 404', async () => {
    const res = await request(app).get('/no-such-route');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Route not found' });
  });
});
