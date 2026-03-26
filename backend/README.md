# Backend (Express + MongoDB + JWT)

This folder is a standalone Node.js backend for the Habit Tracker repo.

## Features
- REST API under `/api/*`
- MongoDB persistence using Mongoose
- JWT auth:
  - Access token in `Authorization: Bearer <token>`
  - Refresh token stored in an `httpOnly` cookie and rotated on refresh

## Setup
1. Create `.env`:
   - Copy `backend/.env.example` → `backend/.env`
2. Install:
   - `cd backend && npm i`
3. Run MongoDB (locally or Docker).
   - Local default URI: `mongodb://127.0.0.1:27017/habittracker`
   - Example Docker command: `docker run -d --name habittracker-mongo -p 27017:27017 mongo`
4. Start:
   - `cd backend && npm run dev`

Server default: `http://localhost:4000`

## API quick map
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/habits`
- `POST /api/habits`
- `PATCH /api/habits/:habitId`
- `DELETE /api/habits/:habitId`
- `POST /api/habits/:habitId/checkins`
- `GET /api/habits/:habitId/checkins`
- `GET /api/habits/:habitId/reminders`
- `POST /api/habits/:habitId/reminders`
- `PATCH /api/reminders/:reminderId`
- `DELETE /api/reminders/:reminderId`
- `GET /api/notifications`
- `POST /api/notifications/:id/dismiss`
- `GET /api/achievements`
- `GET /api/achievements/me`
