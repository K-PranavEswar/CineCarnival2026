# Cine Carnival

A production-ready movie ticket booking web application (similar to BookMyShow) with seat selection and QR ticket generation.

## Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, React Router DOM, Axios, React Context API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + bcrypt
- **QR:** qrcode (npm)

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cine-carnival
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

Start the server:

```bash
npm run dev
```

Server runs at **http://localhost:5000**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**.

### 3. First-time admin user

Register a normal user from the app, then in MongoDB set that user's `role` to `admin`:

```js
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

Or use MongoDB Compass / mongosh to edit the user document and set `role: "admin"`.

## Features

### User
- Register / Login (JWT)
- Browse movies (poster, name, duration, language, rating, description)
- Select theatre per movie
- Visual seat grid: green = available, red = booked, yellow = selected
- Book seats (prevents double booking)
- After booking: redirect to ticket page with QR code (bookingId, movieName, theatreName, seatNumbers, userId)
- My Tickets: list of all bookings with QR and details

### Admin
- Add movies (name, poster, description, duration, language, rating)
- Add theatres (name, movie, rows × seats per row → seat layout)
- View all bookings

## API Overview

| Method | Route | Description |
|--------|--------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/movies` | List movies |
| POST | `/api/movies` | Add movie (admin) |
| GET | `/api/theatres/:movieId` | Theatres for movie |
| POST | `/api/theatres` | Add theatre (admin) |
| POST | `/api/bookings` | Create booking (auth) |
| GET | `/api/bookings/user/:userId` | User's bookings (auth) |
| GET | `/api/bookings/all` | All bookings (admin) |

## Project Structure

```
backend/
  controllers/   # auth, movie, theatre, booking
  models/        # User, Movie, Theatre, Booking
  routes/
  middleware/    # auth (protect, admin)
  server.js

frontend/
  src/
    components/  # Layout
    pages/       # Login, Register, Home, TheatreSelection, SeatSelection, TicketPage, MyTickets, AdminDashboard
    context/     # AuthContext
    services/     # api (axios)
    App.jsx, main.jsx
```

## Security

- Passwords hashed with bcrypt
- Protected routes require valid JWT
- Admin routes check `role === 'admin'`
- CORS configured for frontend origin

## License

MIT
