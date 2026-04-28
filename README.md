# CareSync — Advanced Digital Healthcare & Doctor Appointment System

**Live Link**: https://care-sync-xi.vercel.app/

A production-ready **MERN stack** healthcare application with role-based dashboards for Patients, Doctors, and Admins.

## 📖 Project Overview
- **What is it about?**: CareSync is a comprehensive digital platform that bridges the gap between patients and healthcare providers.
- **Problem Statement**: Scheduling medical appointments often involves long wait times, manual record keeping, and miscommunication between patients and clinics.
- **Goal/Objective**: To streamline the booking process, secure patient medical records, and provide an intuitive dashboard for doctors to manage their practice efficiently.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js (MVC) |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh) + OTP email verification |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Email | Nodemailer |


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
| **Admin** | caresynckalv@gmail.com | 123456 |
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

## 👥 Team & Contributors

| Name | Role | Responsibility |
| :--- | :--- | :--- |
| **Joel Joy** | **Lead** | Project Architecture, Integration, Deployment, and Security. |
| **Himal** | **Developer** | Patient Module, Search Logic, and User Experience. |
| **Kavish** | **Developer** | Doctor Backend, MVC Refactoring, and Schedule Management. |
| **Jaishal** | **Developer** | Payment Integration, Razorpay Webhooks, and Transaction History. |
| **Adithya** | **Developer** | Admin Analytics, Recharts Implementation, and Infrastructure. |

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
