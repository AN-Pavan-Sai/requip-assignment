# Requip User Management System

A full-stack CRUD application for managing user records, built with **TypeScript**, **Express**, **MySQL**, and **React**.

## Architecture

```
requip-assignment/
├── backend/                    # Express REST API
│   ├── src/
│   │   ├── config/db.ts        # MySQL connection pool
│   │   ├── controllers/        # HTTP request handlers
│   │   ├── middleware/         # Error handler, validators
│   │   ├── models/             # TypeScript interfaces & DTOs
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Business logic layer
│   │   ├── utils/              # DB initialization
│   │   ├── __tests__/          # Jest unit tests
│   │   └── server.ts           # Entry point
│   └── package.json
├── frontend/                   # React SPA (Vite)
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── services/           # API client (Axios)
│   │   ├── types/              # Shared TypeScript types
│   │   ├── App.tsx             # Main app shell
│   │   └── index.css           # Design system
│   └── package.json
└── README.md
```

## User Entity

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID (VARCHAR 36) | Primary Key |
| name | VARCHAR(255) | Required, 2-255 chars |
| email | VARCHAR(255) | Required, unique, valid format |
| primaryMobile | VARCHAR(15) | Required, 10-digit Indian mobile |
| secondaryMobile | VARCHAR(15) | Optional |
| aadhaar | VARCHAR(12) | Required, unique, 12 digits |
| pan | VARCHAR(10) | Required, unique, ABCDE1234F format |
| dateOfBirth | DATE | Required, must be in the past |
| placeOfBirth | VARCHAR(255) | Required |
| currentAddress | TEXT | Required |
| permanentAddress | TEXT | Required |
| isDeleted | BOOLEAN | Soft delete flag (default: false) |
| createdAt | TIMESTAMP | Auto-generated |
| updatedAt | TIMESTAMP | Auto-updated |

## Setup & Running

### Prerequisites
- **Node.js** 18+ and npm
- **MySQL** 8.0+ running locally

### 1. Database Setup

```sql
CREATE DATABASE IF NOT EXISTS requip_users;
```

The table is auto-created on server startup.

### 2. Backend

```bash
cd backend
cp .env.example .env    # Edit with your MySQL credentials
npm install
npm run dev             # Starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev             # Starts on http://localhost:5173
```

## API Documentation

Base URL: `http://localhost:5000/api`

### Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/health` | Health check | — |
| `POST` | `/users` | Create user | Full user object |
| `GET` | `/users` | List users (paginated) | Query: `?page=1&limit=10&search=` |
| `GET` | `/users/:id` | Get single user | — |
| `PUT` | `/users/:id` | Update user | Partial user object |
| `DELETE` | `/users/:id` | Soft-delete user | — |

### Response Format

All endpoints return a consistent JSON envelope:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

Paginated responses include:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Example: Create User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "primaryMobile": "9876543210",
    "aadhaar": "123456789012",
    "pan": "ABCDE1234F",
    "dateOfBirth": "1990-01-15",
    "placeOfBirth": "Mumbai",
    "currentAddress": "123 Main St, Mumbai 400001",
    "permanentAddress": "456 Oak Ave, Delhi 110001"
  }'
```

## Running Tests

```bash
cd backend
npm test
```

Unit tests cover the UserService layer with mocked MySQL:
- Create user (success, failure scenarios)
- Update user (partial data, not found, empty update)
- Get all users (pagination math, search filtering)
- Get user by ID (found, not found)
- Delete user (soft delete, not found)

## Best Practices Implemented

### Functional
1. **Layered Architecture** — Controller → Service → Database separation for testability
2. **Input Validation** — Both client-side (React form) and server-side (express-validator)
3. **Parameterized Queries** — All SQL uses `?` placeholders to prevent SQL injection
4. **Soft Delete** — `isDeleted` flag preserves records for audit trails
5. **UUID Primary Keys** — Prevents enumeration attacks vs auto-increment
6. **Pagination** — Server-side with `LIMIT/OFFSET` for efficient large dataset handling
7. **Debounced Search** — 400ms debounce prevents excessive API calls
8. **Consistent API Responses** — Uniform `{ success, message, data }` envelope

### Non-Functional
1. **TypeScript Strict Mode** — Full type safety across both frontend and backend
2. **Connection Pooling** — mysql2 pool with configurable connection limit
3. **Environment Variables** — All config externalized via `.env` (never hardcoded)
4. **CORS Configuration** — Explicitly whitelisted frontend origin
5. **Error Handling** — Global middleware catches unhandled errors, MySQL duplicate key handling
6. **Database Indexes** — Indexes on `isDeleted`, `name`, `email` for query performance
7. **Responsive Design** — Mobile-first CSS with breakpoints
8. **Accessible UI** — ARIA labels, keyboard navigation (Escape to close modals)

## Pain Points & Learnings

### Pain Points
1. **MySQL Date Handling** — MySQL DATE type returns Date objects that need careful serialization when sending to the frontend. Used `.split('T')[0]` to extract the date portion.
2. **Express-Validator with TypeScript** — Type inference for validated request bodies isn't automatic; had to use `validationResult()` explicitly in each controller.
3. **Partial Updates** — Building dynamic SQL UPDATE queries from optional DTO fields required careful handling of undefined vs null vs empty string.
4. **CORS in Development** — Vite dev server runs on port 5173 while Express runs on 5000, requiring explicit CORS configuration.

### Learnings
1. **Connection Pool > Single Connection** — Pools handle concurrent requests gracefully; single connections cause blocking under load.
2. **Soft Delete > Hard Delete** — Always prefer soft deletes in production systems for data recovery and audit compliance.
3. **Defense in Depth Validation** — Never trust client-side validation alone; always validate on the server. Client validation is for UX, server validation is for security.
4. **Debounced Search** — Essential for preventing API spam when users type in search fields. 400ms is a good balance between responsiveness and efficiency.
5. **UUID v4** — Cryptographically random, no sequential guessing possible, but takes more storage than INT (36 chars vs 4 bytes).

## License

This project was created as part of the Requip Machine Coding Round assignment.