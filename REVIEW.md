# HRFlow Detailed Review

## Overview
HRFlow is a full-stack HR & Internal Communication Management Platform built with Next.js 16 (App Router), TypeScript, Prisma ORM, MongoDB, and Tailwind CSS v4. All core features from the BRTGC Engineering Assessment brief are implemented: authentication/authorization, employee management, hierarchical departments, attendance tracking, leave workflow, internal messaging with file sharing, and a role-aware dashboard.

---

## Project Structure

app/
  (auth)/login/page.tsx          - Login form with branding panel
  (auth)/register/page.tsx       - Registration form
  (auth)/actions.ts              - Register/login/logout server actions
  (dashboard)/layout.tsx         - Authenticated layout with sidebar
  (dashboard)/dashboard/page.tsx - Role-aware dashboard
  (dashboard)/employees/         - Employee CRUD pages + actions
  (dashboard)/departments/       - Department hierarchy pages + actions
  (dashboard)/attendance/        - Clock in/out pages + actions
  (dashboard)/leave/             - Leave request pages + actions
  (dashboard)/messages/          - Messaging pages + actions
  api/auth/logout/route.ts       - Logout API endpoint
  api/files/[...path]/route.ts   - Secure file access endpoint
components/
  ui/                            - Reusable primitives (Button, Card, Modal, Input, etc.)
  icons/                         - SVG icon components (no emojis used)
  employees/                     - Employee feature components
  departments/                   - Department feature components
  attendance/                    - Attendance components
  leave/                         - Leave components
  messages/                      - Messaging components
lib/
  auth.ts                        - JWT session management, bcrypt hashing
  prisma.ts                      - Prisma client singleton
  permissions.ts                 - Role-based authorization helpers
  storage.ts                     - File storage abstraction
  validations/index.ts           - Zod schemas for forms
  activity.ts                    - Activity/audit logging
  utils.ts                       - Utility functions
prisma/
  schema.prisma                  - Database schema
  seed.ts                        - Seed data with admin, HR manager, employees, departments
---

## Architecture Decisions

### Why Next.js App Router?
- Server Components allow data fetching close to the database, reducing client-side JavaScript
- Server Actions provide type-safe form handling without an extra API layer
- Middleware handles session validation at the edge before rendering
- Metadata API for SEO

### Why Prisma + MongoDB?
- Prisma provides type-safe queries, migrations, and seeding
- MongoDB document model suits the hierarchical department structure and flexible messaging participants
- Relation modeling with Prisma ensures referential integrity

### State Management Decision
- No global state library (Redux/Zustand) was introduced
- Server state stays on the server via Server Components and Server Actions
- Client state managed with React useState/useEffect within components
- This follows the PDF guidance: "Server state should preferably remain on the server where appropriate"

### Authentication Approach
- JWT signed with HS256 via jose library
- httpOnly, secure, sameSite=lax cookies for session persistence (7 days)
- Password hashing with bcrypt (cost factor 12)
- Session validated in middleware for protected routes
- getCurrentUser() re-fetches from DB to check employmentStatus and role

### Authorization Approach
- Role-based: ADMIN, HR_MANAGER, EMPLOYEE
- Permission helpers in lib/permissions.ts check roles server-side
- All Server Actions call requireAuth() first, then check canManage* functions
- UI visibility is secondary - server always verifies permissions
- Example: deleteEmployee checks user.role === Role.ADMIN explicitly

### Department Hierarchy
- Self-referential relation: Department.parentId -> Department.id
- Children tracked via relation
- Cycle prevention in createDepartment/updateDepartment via wouldCreateCycle() traversal
- Department head must be an active employee (validated on create/update)
- Cannot delete department with children (enforced in deleteDepartment)

### Messaging Architecture
- Reusable Conversation/Message/Participant model
- ConversationParticipant supports both userId and departmentId
- ConversationType enum: PRIVATE, DEPARTMENT, DEPARTMENT_TO_EMPLOYEE
- Private conversations remain private - department heads do NOT automatically get access
- Departmental communications may be visible up the hierarchy (future expansion point)

### File Attachment Architecture
- Files stored on disk under ./public/uploads (production would use S3/GCS)
- Database stores metadata: originalName, mimeType, size, storageKey
- Access via /api/files/[...path] route with isSafeStorageKey validation
- Files are not directly guessable - must have valid storageKey
---

## Database Design

### Prisma Models

**User** - Employees with role, employment status, department relation
- id, email (unique), password, fullName, phone, role, position
- employmentStatus, dateJoined, profileImage
- departmentId (FK), headedDepartments (relation)
- attendances, leaveRequests, sentMessages, participations, activities
- Indexes: departmentId, role, employmentStatus

**Department** - Hierarchical organization structure
- id, name, description
- parentId (self-FK for hierarchy), headId (FK to User)
- employees (relation), children (self-relation), participations
- Indexes: parentId, headId

**Attendance** - Daily attendance records
- id, userId, date, clockIn, clockOut, status, notes
- Unique constraint: [userId, date] - prevents duplicate clock-ins
- Indexes: userId, date

**LeaveRequest** - Leave workflow
- id, userId, leaveType, startDate, endDate, reason, status
- reviewedById, reviewNote, reviewedAt
- Indexes: userId, status, [startDate, endDate]

**Conversation** - Messaging container
- id, type (PRIVATE/DEPARTMENT/DEPARTMENT_TO_EMPLOYEE), title
- participants (ConversationParticipant[]), messages (Message[])

**ConversationParticipant** - Who is in a conversation
- id, conversationId, userId?, departmentId?
- Unique constraints: [conversationId, userId], [conversationId, departmentId]
- A participant is either a User OR a Department

**Message** - Individual messages
- id, conversationId, senderId, content, createdAt
- attachments (Attachment[])

**Attachment** - File metadata
- id, messageId, originalName, mimeType, size, storageKey, createdAt

**Activity** - Audit log
- id, actorId, action, entityType, entityId, metadata, createdAt

### Why This Design?

1. Department hierarchy uses self-referential parentId - simple, flexible, supports any depth
2. ConversationParticipant abstraction allows the same conversation table to support private chats, department broadcasts, and department-to-department without separate tables
3. Attachment stores only metadata in MongoDB - actual files in object storage (S3 pattern)
4. Activity model captures audit trail without polluting business tables
5. Unique constraint on [userId, date] in Attendance prevents duplicate clock-ins at the database level

### Scalability Considerations
- For 100,000 employees: add read replicas, consider sharding by department
- Messaging: partition conversations by conversationId, use time-based TTL on old messages
- Attendance: archive old records to cold storage
- File storage: S3 with CDN for delivery
---

## Potential Interview Questions & Answers

### Architecture
Q: Why did you structure the project this way?
A: The app/ directory follows Next.js App Router conventions with route groups ((auth), (dashboard)). Feature modules are co-located with their pages and actions. Components are split into ui/ primitives and feature-specific components. This separation of concerns makes each feature independent and testable.

Q: Why did you separate certain modules?
A: lib/ contains pure business logic (auth, permissions, storage, validation) that can be reused across Server Components and Server Actions. components/ contains presentational and container components. This separation allows server-side logic to be reused without client bundle overhead.

Q: How would the architecture evolve as the application grows?
A: Features could be extracted into standalone packages. Server Actions could be replaced with a dedicated API layer if needed. The messaging system could add Socket.io for realtime. File storage would move to S3. Read replicas and caching layers would be added for scale.

### Database Modelling
Q: Why did you choose your Prisma models?
A: Each model represents a real-world entity with clear relationships. The self-referential Department model handles hierarchy naturally. ConversationParticipant acts as an abstraction layer supporting both user and department participants. This avoids separate tables for each message type.

Q: How did you model the department hierarchy?
A: Using a self-referential parentId field on the Department model with a Prisma relation. This supports arbitrary depth. The wouldCreateCycle() function traverses ancestors to prevent circular references. The headId field links a department to its head user.

Q: How are employee relationships represented?
A: User has a departmentId foreign key to Department. Department has a headId foreign key to User. These create the relationships between employees and their departments, and between departments and their heads.

Q: How are conversations and participants represented?
A: Conversation is a container. ConversationParticipant links a conversation to either a User (userId) or a Department (departmentId). This allows the same conversation infrastructure to support private chats, department broadcasts, and cross-department communication.

Q: How are message attachments represented?
A: Attachment model stores metadata (originalName, mimeType, size, storageKey) and links to a Message. The actual file content is stored on disk (or S3 in production). The storageKey is a unique path that is not guessable.

Q: How would you handle larger datasets?
A: Add database indexes (already present on key fields), use read replicas for queries, shard by department, archive old attendance and leave records, use connection pooling, and implement caching for frequently accessed data like department hierarchy.

### Authorization
Q: How are roles enforced?
A: The User model has a role field (ADMIN, HR_MANAGER, EMPLOYEE). Every Server Action calls requireAuth() to get the session, then checks permission helpers (canManageEmployees, canManageDepartments, canApproveLeave). The middleware also validates session existence for protected routes.

Q: How are department permissions enforced?
A: canManageDepartments() checks for ADMIN or HR_MANAGER roles. Department creation/update/delete also validates the head must be an active employee. Cycle prevention ensures hierarchy integrity.

Q: How does departmental message visibility work?
A: Departmental messages are scoped to participants. The hierarchy can be resolved upward so department heads can see communications from child departments. Private employee-to-employee conversations are NOT affected by hierarchy - they remain private to participants only.

Q: Why are private employee messages treated differently?
A: The PDF explicitly states private conversations must not be exposed through department hierarchy. The canViewConversation permission helper checks if the user is a direct participant. Departmental conversations use a different visibility model that respects hierarchy.

### State Management
Q: Why did you choose this state management approach?
A: Server state (user data, records) stays on the server via Server Components and Server Actions. Client state (form inputs, modal open/close, search filters) uses React useState/useEffect. No global state library was introduced because there is no shared client state that needs to be synced across components.

Q: What state belongs on the server?
A: User authentication session, employee data, department hierarchy, attendance records, leave requests, conversations and messages. These are fetched fresh on each request via Prisma.

Q: What state belongs on the client?
A: Form submission states, modal visibility, search/filter inputs, pagination current page, message composition text. These are ephemeral UI states that do not need to be shared across components.

Q: How would you handle realtime updates?
A: Socket.io could be added for realtime messaging. Server Actions would emit events to connected clients. For attendance and leave, polling or Server-Sent Events could be used. This was intentionally left as a future enhancement.

### Libraries
Q: Why did you select particular libraries?
A: Next.js 16 for App Router and Server Actions. Prisma for type-safe database access. MongoDB for flexible document model. Tailwind CSS v4 for utility-first styling. Zod for runtime validation. jose for JWT (smaller than jsonwebtoken). bcryptjs for password hashing. react-hook-form + zod resolver for form management.

Q: What alternatives were considered?
A: Redux/Zustand for state - rejected because no shared client state needed. NextAuth.js for auth - rejected because custom JWT gives more control. Mongoose instead of Prisma - rejected because Prisma provides better TypeScript support. Material UI / Ant Design - rejected because custom Tailwind components match the design better.

### Scalability
Q: What would you change for 100,000 employees?
A: Add read replicas for queries, shard MongoDB by department, implement Redis caching for department hierarchy and user sessions, use pagination with cursor-based navigation, add connection pooling, and implement background job queues for email notifications.

Q: How would you scale messaging?
A: Partition conversations by conversationId across shards. Use a message queue (Kafka/RabbitMQ) for delivery. Implement read replicas for conversation history. Add Redis for online user presence. Compress old messages. Use Socket.io namespaces for different conversation types.

Q: How would you handle large file uploads?
A: Use multipart uploads for large files. Store in S3 with presigned URLs. Validate file type and size before upload. Use background workers for virus scanning. Implement resumable uploads. Store thumbnails for images. Use CDN for delivery.


### Assumptions & Tradeoffs
Q: What assumptions did you make?
A: First registered user becomes ADMIN. Employee deactivation is a soft delete (preserves historical data). Department heads must be active employees. Private messages are not visible to department heads. File access requires a valid storage key. Attendance uses daily records with unique constraint per user per day.

Q: What tradeoffs were made?
A: Local disk storage instead of S3 (simpler for assessment, less secure). No realtime messaging (Socket.io optional). No email integration. No dark mode. No PWA. No offline support. These are documented as future enhancements.

### Areas for Improvement
With more time: add realtime messaging via Socket.io, implement email notifications, add dark mode, implement file previews, add message reactions, add search with Elasticsearch, add comprehensive tests, add Docker configuration, add API documentation.

### Bugs Encountered & Fixes
1. Syntax error in leave/actions.ts: extra parenthesis in return statement - fixed by removing ).
2. Typo in employees-client.tsx: totalsPage instead of totalPages in useEffect - fixed.
3. Duplicate files created (app-shell.tsx, mobile-nav.tsx, utils.tsx) - removed duplicates.
4. Emojis used as icons - replaced all with SVG icon components in components/icons/index.ts.
5. Unused imports (PaperclipIcon, UsersIcon, BuildingIcon) - cleaned up.
