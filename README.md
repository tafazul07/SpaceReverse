# SpaceReverse

SpaceReverse is an event-hall booking application with a React frontend, an Express API, PostgreSQL storage, and planned AI-assisted booking flows.

## Project Structure

```text
SpaceReverse/
├── backend/
│   ├── server.js
│   ├── db.js
│   └── sql/schema.sql
├── frontend/
│   ├── public/index.html
│   └── src/
├── .env
└── package.json
```

## Requirements

- Node.js 18 or newer
- npm
- A PostgreSQL database, such as Neon

## Environment Variables

Create or update the root `.env` file:

```env
DATA_CONNECTION=postgresql://username:password@host/database?sslmode=require
PORT=4000
OPENAI_API_KEY=your_openai_api_key
```

Keep `.env` private and never commit real credentials.

## Database Setup

Run the SQL schema against the PostgreSQL database configured in `DATA_CONNECTION`:

```bash
psql "$DATA_CONNECTION" -f backend/sql/schema.sql
```

The schema creates tables for halls, menu packages, bookings, and chat sessions.

## Install Dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Run the Projects

Start the backend from the `backend` directory:

```bash
npm run dev
```

Start the frontend from a second terminal in the `frontend` directory:

```bash
npm run dev
```

The frontend development server normally runs at `http://localhost:5173`.

## Available Scripts

### Backend

- `npm run dev` starts the API with Node's watch mode.
- `npm start` starts the API normally.

### Frontend

- `npm run dev` starts Vite in development mode.
- `npm run build` creates a production build.
- `npm run preview` previews the production build locally.

## Current Status

The folder structure, dependency manifests, PostgreSQL pool, and initial schema are in place. API routes and frontend components are still under development.
