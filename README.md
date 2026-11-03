# Online Chat App

An online chat application where users can create or join chat rooms and exchange messages in real time. The frontend is a React single-page application, and the backend provides a REST API, MongoDB persistence, and Socket.IO events.

## Features

- Register and sign in with an email and password.
- Create chat rooms and share their six-character room codes.
- Join a room using its code and see its members.
- Send and receive messages in real time.
- Load recent room messages first, with older history available on demand, and revisit recent rooms.
- Passwords are hashed, and authenticated API requests use JSON Web Tokens.
- Messages expire after three days. Rooms are removed after three days without activity.

## Technology

- **Frontend:** React, Vite, React Router, Tailwind CSS, Socket.IO Client
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens and bcrypt

## Requirements

- Node.js and npm (use a Node.js release supported by the Vite version in `Frontend/package.json`).
- A MongoDB database, either a local MongoDB server or a MongoDB Atlas cluster.

## Installation

1. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/Adityarajbind/Chat-App.git
   cd Chat-App
   ```

2. Configure the backend by copying `Backend/.env.example` to `Backend/.env`:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/online-chat-app
   JWT_SECRET=replace-this-with-a-long-random-secret
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

   Replace `MONGO_URI` with your MongoDB Atlas connection string if you are using Atlas, and set a unique `JWT_SECRET`. Keep `.env` files private and do not commit real credentials or secrets.

3. Install backend dependencies and start the API/socket server:

   ```bash
   cd Backend
   npm ci
   npm run dev
   ```

   The backend runs at `http://localhost:5000`. For a normal start without the development watcher, use `npm start`.

4. Open a second terminal from the project directory. Copy `Frontend/.env.example` to `Frontend/.env` and set `VITE_BACKEND_URL` to the backend's base URL (without an `/api` suffix). This is the single frontend setting used by both REST requests and Socket.IO:

   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

   Then install frontend dependencies and start Vite:

   ```bash
   cd Frontend
   npm ci
   npm run dev
   ```

5. Open the local URL printed by Vite (by default, `http://localhost:5173`) and register an account.

The backend and frontend must both be running, and MongoDB must be reachable by the backend.

## Development

Run these commands from their respective directories:

| Directory | Command | Description |
| --- | --- | --- |
| `Backend` | `npm run dev` | Start the backend with Nodemon |
| `Backend` | `npm start` | Start the backend with Node.js |
| `Frontend` | `npm run dev` | Start the Vite development server |
| `Frontend` | `npm run build` | Create a production frontend build in `Frontend/dist` |
| `Frontend` | `npm run preview` | Preview the production frontend build |
| `Frontend` | `npm run lint` | Run ESLint |

## Project structure

```text
Backend/
  config/        MongoDB connection
  controllers/   Authentication, room, and message handlers
  middleware/    JWT authentication middleware
  models/        User, room, and message schemas
  routes/        REST API routes
  server.js      Express and Socket.IO server
Frontend/
  src/
    api/         Frontend API helpers
    components/  Authentication, room, and shared UI components
    context/     Authentication and toast contexts
    pages/       Authentication, home, and chat room screens
    socket.js    Socket.IO client connection
```

## API overview

The backend exposes these route groups:

- `/api/auth` — registration, login, and authenticated profile lookup
- `/api/rooms` — create, join, leave, and inspect rooms and members
- `/api/messages` — send messages and retrieve room message history

`GET /api/messages/:roomCode` returns the latest 50 messages and a `hasMore` flag.
Pass `limit` to change the page size (up to 100), then use `beforeCreatedAt`
and `beforeId` from the oldest message to retrieve older pages. Send requests may
include a unique `clientMessageId` to make retries idempotent.

The Socket.IO server broadcasts room messages and member join/leave notifications.

## Environment configuration

The frontend reads its backend address from `Frontend/.env` as `VITE_BACKEND_URL`; update that value once to point both the API and Socket.IO client at a different backend. The backend uses `Backend/.env` for `PORT`, `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL` (the allowed frontend origin for Socket.IO). Example files are provided in both folders.
