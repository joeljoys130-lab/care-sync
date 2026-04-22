# CareSync

## Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB (Mongoose)**

## Setup Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Core Features
- **Auth (JWT):** Secure registration and login for all users.
- **Doctor Listing:** Fetch and display available doctors for booking.
- **Appointment Booking & Cancellation:** Patients can book available time slots with doctors and cancel them if needed.

## API Base URL
`http://localhost:5000/api`
