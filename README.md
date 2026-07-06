# TicketSetu — Indian Multi-Category Ticket Booking Platform

A full-stack booking platform for **movies, buses, trains, and events**, built as a portfolio project.

## Tech Stack
- **Frontend:** React.js, React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Auth:** JWT + bcrypt
- **Extras:** QR code ticket generation, mock payment flow (Razorpay integration point included)

## Features
- Browse movies, buses, trains, and events by category, city, or search
- Interactive seat map with premium/normal seat pricing
- Secure signup/login (JWT)
- Seat locking with DB transactions to prevent double-booking
- Mock payment confirmation → generates a QR-code e-ticket
- Booking history with cancel option (releases seats)
- Admin dashboard to add listings, create showtimes (auto-generates seats), and view all bookings

## Project Structure
```
ticketing-platform/
├── backend/
│   ├── config/db.js          # MySQL connection pool
│   ├── controllers/          # Route logic (auth, events, bookings, admin)
│   ├── middleware/auth.js    # JWT verification + admin guard
│   ├── routes/               # Express routers
│   ├── schema.sql            # Full DB schema + seed data
│   ├── server.js             # App entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js      # Axios instance with auth header
    │   ├── context/AuthContext.js
    │   ├── components/       # Navbar, EventCard, SeatMap
    │   ├── pages/            # Home, Login, Signup, EventList, EventDetail,
    │   │                       SeatSelection, Payment, MyBookings, Admin
    │   └── App.js
    └── .env.example
```

## Setup

### 1. Database
```bash
mysql -u root -p < backend/schema.sql
```
This creates the `ticketsetu` database with tables and seed data (a sample movie, bus, train, and event).

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in your MySQL password and a JWT secret
npm run dev             # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start                # starts on http://localhost:3000
```

### 4. Create an Admin User
Sign up normally through the app, then promote the account manually:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```
Log back in to see the **Admin** tab in the navbar.

## Notes on Payments
The `Payment.jsx` page simulates a successful payment for demo purposes. To go live:
1. Add Razorpay's `checkout.js` script and create a real order via their API in `createBooking`.
2. Verify the payment signature server-side before calling `confirmPayment`.
3. Store the real `razorpay_payment_id` (the field already exists in the `payments` table).

## API Endpoints Summary
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login |
| GET | /api/events | List events (filters: category, city, search) |
| GET | /api/events/:id | Event details + showtimes |
| GET | /api/shows/:showId/seats | Seat map for a show |
| POST | /api/bookings | Create booking (auth required) |
| POST | /api/bookings/:id/confirm-payment | Confirm payment, get QR ticket |
| GET | /api/bookings/my | User's booking history |
| POST | /api/bookings/:id/cancel | Cancel booking |
| POST | /api/admin/events | Create listing (admin) |
| POST | /api/admin/shows | Create showtime with auto-generated seats (admin) |
| GET | /api/admin/bookings | All bookings (admin) |

## Possible Next Steps
- Real Razorpay integration
- Email ticket delivery (Nodemailer)
- Deploy: backend on Render/Railway, frontend on Vercel/Netlify, DB on PlanetScale/Railway MySQL
