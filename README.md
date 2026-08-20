# Career Guidance Platform

AI-Powered Career Guidance and Academic Pathway Recommendation Platform for Sri Lankan Arts Stream Students.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: Helmet, CORS

## Project Structure

```
career-guidance-platform/
├── frontend/          # React frontend (upcoming)
├── backend/           # Express API server
│   ├── src/
│   │   ├── config/    # Database configuration
│   │   ├── controllers/
│   │   ├── middleware/ # Error handling
│   │   ├── models/    # Mongoose schemas
│   │   ├── routes/    # API route modules
│   │   ├── services/
│   │   ├── utils/     # Utilities (AppError)
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

Response:

```json
{
  "success": true,
  "message": "Career Guidance API is running"
}
```

### Available Route Prefixes

| Route | Status |
|-------|--------|
| `/api/health` | Active |
| `/api/auth` | Planned |
| `/api/students` | Planned |
| `/api/academic-profile` | Planned |
| `/api/universities` | Planned |
| `/api/degrees` | Planned |
| `/api/recommendations` | Planned |
| `/api/skills` | Planned |
| `/api/roadmaps` | Planned |
| `/api/admin` | Planned |
