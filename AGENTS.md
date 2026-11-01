# knit-civic-server

Backend API service for KnitCivic built with Express 5, Node.js (ESM), and MongoDB native driver.

## Commands

- `npm run dev` — runs the server in watch mode using Node 18+ (`node --watch index.js`)
- `npm start` — runs the server in production mode (`node index.js`)

## Stack & Architecture

- **Runtime**: Node.js (ES Modules, `"type": "module"` in `package.json`).
- **Framework**: Express 5 (`express`).
- **Database**: MongoDB via the native `mongodb` driver (`MongoClient`, `ObjectId`). Database name: `knit-civic`.
- **Port**: Default is `8000`.

## API Endpoints

- `GET /` — API health check.
- `POST /create-event` — Create a new event.
- `GET /events` — List all events.
- `GET /events/:email` — List all events created by a user's email.
- `GET /events/single/:id` — Get a single event by ID.
- `PUT /events/:id` — Update an existing event.
- `DELETE /events/:email/:id` — Delete an event created by a specific user.
- `DELETE /events/:id` — Delete an event by ID.
- `POST /join-event` — Join / register for an event.
- `GET /join-event/status?eventId=...&userEmail=...` — Check if a user has joined an event.
- `DELETE /join-event` — Leave an event (body: `{ eventId, userEmail }`).
- `DELETE /join-event/:id` — Leave an event by registration document ID.
- `GET /join-event/:email` — List all events joined by a user.
