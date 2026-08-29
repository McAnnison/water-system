# SDK Alkaline Water Management System

A full-stack web application for managing internal operations at SDK Alkaline Water Limited. Handles water production tracking, inventory management, financial transactions, and team coordination.

## Tech Stack

- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL
- **Frontend**: React (Vite), Tailwind CSS, Recharts, React Router
- **Email**: Nodemailer (Gmail integration)
- **Auth**: JWT with role-based access control (RBAC)

## Roles & Dashboards

| Role | Dashboard Features |
|------|-------------------|
| **Admin** | Full financial overview, AI decision assistant, charts, notifications, user management, transaction logging |
| **CEO** | Executive summary, financial charts, production overview, user management |
| **Factory Supervisor** | Production monitoring, stock levels, efficiency metrics, dispatch tracking |
| **Field Manager** | Dispatch tracking, distribution overview, stock status |
| **Staff** | Daily log submission, log history |

## Setup

### Backend

```bash
cd backend
npm install
# Configure .env with your database URL, JWT secret, and email credentials
npx prisma migrate dev --schema=prisma/schema.prisma
npx prisma generate --schema=prisma/schema.prisma
node prisma/seed.js
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```
DATABASE_URL="postgresql://user:password@localhost:5432/water_system_db"
JWT_SECRET="your_secret_key"
JWT_EXPIRES_IN="1d"
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
EMAIL_USER="your_gmail@gmail.com"
EMAIL_PASS="your_gmail_app_password"
ADMIN_EMAIL="admin_notification_email@gmail.com"
```

## Production Deployment (Docker)

Create a `.env` file at the repo root with at least:

```
POSTGRES_PASSWORD=strong_db_password
JWT_SECRET=long_random_string
```

Then build and start everything (PostgreSQL, API, and the Nginx-served frontend):

```bash
docker compose up -d --build
```

The app is served on port 8080 by default (override with `APP_PORT`). Database
migrations run automatically on backend startup via `prisma migrate deploy`.
To seed initial users: `docker compose exec backend node prisma/seed.js`.

> **Important:** rotate the default seeded passwords immediately after the first
> deployment. Set `CORS_ORIGIN` to your real frontend origin in production.

## Default Credentials (after seeding)

| Email | Password | Role |
|-------|----------|------|
| ceo@sdkwater.com | admin123 | CEO |
| admin@sdkwater.com | admin123 | Admin |
| supervisor@sdkwater.com | admin123 | Factory Supervisor |
| field@sdkwater.com | admin123 | Field Manager |
| staff@sdkwater.com | admin123 | Staff |
