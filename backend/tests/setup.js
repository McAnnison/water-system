process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

jest.mock('../lib/prisma', () => require('./helpers').prismaMock);
jest.mock('../services/emailService', () => ({
  sendNotificationEmail: jest.fn().mockResolvedValue(undefined)
}));

jest.spyOn(console, 'error').mockImplementation(() => {});
