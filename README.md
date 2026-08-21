# Career Guidance Platform

AI-Powered Career Guidance and Academic Pathway Recommendation Platform for Sri Lankan Arts Stream Students.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcryptjs
- **Security**: Helmet, CORS, express-rate-limit

## Project Structure

```
career-guidance-platform/
├── frontend/          # React frontend (upcoming)
├── backend/           # Express API server
│   ├── src/
│   │   ├── config/    # Database configuration
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/ # Auth, error handling
│   │   ├── models/    # Mongoose schemas
│   │   ├── routes/    # API route modules
│   │   ├── services/
│   │   ├── utils/     # Utilities (AppError, JWT)
│   │   └── app.js     # Express app setup
│   ├── scripts/       # Seed and utility scripts
│   ├── server.js      # Entry point
│   └── package.json
├── dataset/           # GuidanceDataset.xlsx
└── docs/
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | — |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `JWT_SECRET` | Secret key for signing JWTs | — |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |

### Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### Seed the Database

Import the prepared dataset from `dataset/GuidanceDataset.xlsx`:

```bash
npm run seed
```

Re-running the seed command is safe — existing records are updated, not duplicated.

## API

### Health Check

```
GET /api/health
```

### Authentication

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <token>
```

#### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Panzi",
  "lastName": "Wick",
  "email": "panzi@example.com",
  "password": "securepass123"
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "panzi@example.com",
  "password": "securepass123"
}
```

### Student Profile

```
GET  /api/students/me           # Get own profile
PUT  /api/students/me           # Update own profile (firstName, lastName)
```

### Academic Profile

```
GET  /api/academic-profile/me   # Get own academic profile
PUT  /api/academic-profile/me   # Update (interests, careerPreferences, existingSkills)
```

### Available Route Prefixes

| Route | Status |
|-------|--------|
| `/api/health` | Active |
| `/api/auth` | Active |
| `/api/students` | Active |
| `/api/academic-profile` | Active |
| `/api/universities` | Planned |
| `/api/degrees` | Planned |
| `/api/recommendations` | Planned |
| `/api/skills` | Planned |
| `/api/roadmaps` | Planned |
| `/api/admin` | Planned |
