# Career Guidance Platform

AI-Powered Career Guidance and Academic Pathway Recommendation Platform for Sri Lankan Arts Stream Students.

## Key Features

- **Student Academic Profiling:** Capture A/L subjects, O/L results, interests, and career preferences for personalized evaluation.
- **Career & Degree Recommendations:** An intelligent rules-engine matching student profiles to ideal career paths and degree programs.
- **Skill Gap Analysis & Roadmaps:** Identify missing skills for desired careers and provide step-by-step learning roadmaps and resources.
- **Comprehensive Database:** Backed by an extensive dataset of Sri Lankan Arts Stream data (`GuidanceDataset.xlsx`).
- **Role-Based Access Control:** Distinct experiences for Students (seeking guidance) and Admins (managing educational data, universities, degrees, and rules).

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcryptjs
- **Security**: Helmet, CORS, express-rate-limit

## Project Structure

```
career-guidance-platform/
├── frontend/          # React frontend (Vite)
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

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Environment Variables

**Backend (`backend/.env`):**

Copy the example and fill in your values:

```bash
cd backend
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

**Frontend (`frontend/.env`):**

Copy the example and fill in your values:

```bash
cd frontend
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000/api` |

### Start the Application

**Start Backend (from `backend/` directory):**

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

**Start Frontend (from `frontend/` directory):**

```bash
# Development
npm run dev

# Production
npm run build
npm run preview
```

### Seed the Database

Import the prepared dataset from `dataset/GuidanceDataset.xlsx`:

```bash
npm run seed
```

Re-running the seed command is safe — existing records are updated, not duplicated.

## Testing

The backend includes several test scripts to verify the core logic:

```bash
cd backend
npm run test:all       # Runs all test suites
npm run test:m4        # Tests educational data and rules logic
npm run test:admin     # Tests admin functionalities
```

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
| `/api/universities` | Active |
| `/api/degrees` | Active |
| `/api/recommendations` | Active |
| `/api/skills` | Active |
| `/api/roadmaps` | Active |
| `/api/admin` | Active |
| `/api/careers` | Active |
| `/api/subject-combinations` | Active |
