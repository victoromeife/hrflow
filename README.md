# HRFlow — HR & Internal Communication Management Platform

A modern, secure, and scalable HR and internal communication platform built with Next.js (App Router), TypeScript, Prisma ORM, and MongoDB.

## Features

- Authentication & Authorization (Admin, HR Manager, Employee roles)
- Employee Management (CRUD, search, filter, deactivate)
- Department Management (hierarchical structure with parent/child)
- Attendance Management (clock in/out, history, stats)
- Leave Request System (submit, approve, reject, cancel)
- Internal Messaging (employee-to-employee, employee-to-department, department-to-department, department-to-employee)
- File Sharing (attach files to messages with secure access)
- Dashboard with role-based statistics
- Activity/Audit logging
- Secure password hashing (bcrypt)
- Server-side authorization enforcement

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma ORM + MongoDB
- Tailwind CSS (v4)
- Zustand/React state for client state
- jose for JWT sessions
- bcryptjs for password hashing
- zod for validation

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd hrflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

Required environment variables:
```env
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/hrflow?retryWrites=true&w=majority"
AUTH_SECRET="your-secret-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Generate Prisma client and push schema:
```bash
npx prisma generate
npx prisma db push
```

5. Seed the database:
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Credentials
- Admin: `admin@hrflow.com` / `Admin@123`
- Employees: `Welcome@123` (alice@hrflow.com, bob@hrflow.com, etc.)

## Architecture

### Application Structure
- `app/(auth)/` — Authentication pages (login, register)
- `app/(dashboard)/` — Protected application areas
- `components/` — Reusable UI components and feature modules
- `lib/` — Utilities (auth, prisma, permissions, storage, validation, activity)
- `prisma/` — Prisma schema and seed data

### Authentication
- JWT-based sessions stored in httpOnly cookies (jose library)
- Password hashing with bcrypt (cost factor 12)
- Server-side session validation via `getCurrentUser()`
- Middleware protects all dashboard routes

### Authorization
- Role-based access control (ADMIN, HR_MANAGER, EMPLOYEE)
- Server-side enforcement via permission helpers in `lib/permissions.ts`
- Never rely solely on UI visibility — all actions verify permissions server-side

### Database Architecture
- MongoDB via Prisma
- Department hierarchy via self-referential relation (parent/children)
- Conversations use a participant abstraction supporting both User and Department
- Message attachments store metadata in MongoDB, files on disk (S3-compatible in production)

### State Management
- Server state stays on the server (Server Components + Server Actions)
- Client state managed with React hooks (useState, useContext)
- No global state library — only introduced where meaningful value exists

## Assumptions
- First registered user becomes ADMIN; subsequent users default to EMPLOYEE
- Employee deactivation preserves historical records (soft delete via employmentStatus)
- Department heads must be active employees
- Private employee-to-employee messages are not visible to department heads
- Departmental messages may be visible up the hierarchy per authorization rules
- File access requires a valid storage key (not guessable URLs)

## Tradeoffs
- File storage uses local disk (./public/uploads) for simplicity; production would use S3/GCS
- Realtime messaging not implemented (optional bonus feature)
- No email integration (optional bonus feature)

## License
Private assessment project.
