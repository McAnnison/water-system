const jwt = require('jsonwebtoken');

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn()
  },
  dailyLog: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  transaction: {
    findMany: jest.fn(),
    create: jest.fn()
  },
  notification: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn()
  }
};

const users = {
  ceo: { id: 'user-ceo', name: 'CEO User', email: 'ceo@sdkwater.com', role: 'CEO' },
  admin: { id: 'user-admin', name: 'Admin User', email: 'admin@sdkwater.com', role: 'ADMIN' },
  supervisor: { id: 'user-sup', name: 'Supervisor', email: 'supervisor@sdkwater.com', role: 'FACTORY_SUPERVISOR' },
  staff: { id: 'user-staff', name: 'Staff User', email: 'staff@sdkwater.com', role: 'STAFF' },
  field: { id: 'user-field', name: 'Field Manager', email: 'field@sdkwater.com', role: 'FIELD_MANAGER' }
};

const tokenFor = (user) => jwt.sign({ id: user.id }, process.env.JWT_SECRET);

const authAs = (user) => {
  prismaMock.user.findUnique.mockResolvedValueOnce(user);
  return { Authorization: `Bearer ${tokenFor(user)}` };
};

const resetMocks = () => {
  Object.values(prismaMock).forEach((model) => {
    Object.values(model).forEach((fn) => fn.mockReset());
  });
};

module.exports = { prismaMock, users, tokenFor, authAs, resetMocks };
