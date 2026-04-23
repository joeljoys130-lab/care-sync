# CareSync — Advanced Digital Healthcare & Doctor Appointment System

A production-ready **MERN stack** healthcare application with role-based dashboards for Patients, Doctors, and Admins.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js (MVC) |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh) + OTP email verification |
| Charts | Recharts |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Email | Nodemailer |
| Payments | Stripe (mock-ready) |

---

## 📁 Folder Structure

```
CareSync/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Business logic (10 controllers)
│   ├── middleware/       # auth, authorize, errorHandler, validate, upload
│   ├── models/          # 8 Mongoose schemas
│   ├── routes/          # 10 route files
│   └── utils/           # email, OTP, tokens, notifications, seed
│
└── frontend/
    └── src/
        ├── api/          # Axios instance + all API service functions
        ├── components/   # Reusable UI components
        ├── context/      # AuthContext
        └── pages/        # auth, patient, doctor, admin
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
npm install

# Copy .env.example and fill in your values
cp .env.example .env
# Edit MONGO_URI, email credentials, JWT secrets

npm run seed    # Seed demo data
npm run dev     # Start on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Start on http://localhost:5173
```

---

## 🔑 Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@caresync.com | admin123 |
| **Doctor** | sarah@caresync.com | doctor123 |
| **Patient** | alice@example.com | patient123 |

---

## 🎯 Features

### Patient
- 🔐 Register/login with email OTP verification
- 🔍 Search & filter doctors (specialization, city, fees, rating)
- 📅 Slot-based appointment booking (no double-booking)
- 💳 Mock payment on booking confirmation
- 📋 View medical records & prescriptions
- ❤️ Save favorite doctors
- 🔔 Notification center

### Doctor
- 📊 Dashboard with today's schedule
- ✅ Confirm/complete/cancel appointments
- ⏰ Set weekly availability & slot duration
- 💰 Earnings overview with monthly chart
- 👤 Profile & bio management

### Admin
- 📈 Analytics dashboard (Recharts: area, bar, pie charts)
- ✅ Approve/reject pending doctor registrations
- 👥 User management (activate/deactivate)
- 📋 All appointments with status filtering

---

## 🔒 Security

- JWT access tokens (15 min) + refresh tokens (7 days)
- Bcrypt password hashing (12 salt rounds)
- Helmet, CORS, rate limiting
- MongoDB injection prevention (express-mongo-sanitize)
- Validation on every endpoint (express-validator)
- Role-based authorization middleware

---

## 📡 API Endpoints Summary

| Resource | Base Path |
|---------|-----------|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Doctors | `/api/doctors` |
| Patients | `/api/patients` |
| Appointments | `/api/appointments` |
| Payments | `/api/payments` |
| Medical Records | `/api/records` |
| Reviews | `/api/reviews` |
| Notifications | `/api/notifications` |
| Admin | `/api/admin` |

Health check: `GET /api/health`
