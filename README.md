# 🎬 IMovies — Cinema Booking & Management Platform

> **A modern full-stack MERN cinema booking platform with real-time seat availability, movie discovery, showtime management, digital tickets, payments, and an admin management console.**

IMovies is a full-stack online cinema ticketing and theatre management system designed to provide a seamless movie-booking experience. Users can browse **Bollywood and Hollywood movies**, explore showtimes, select seats in real time, purchase tickets, manage bookings, and receive digital cinema passes.

The platform is built using the **MERN stack — MongoDB, Express.js, React.js, and Node.js** — with JWT-based authentication, role-based access control, real-time seat management, and a responsive user interface.

---

## ✨ Features

### 🎥 Movie Discovery

* Browse Hollywood and Bollywood movies
* IMDb-style movie ratings
* Movie search and filtering
* Filter by:

  * Genre
  * Language
  * City
  * Release status
  * Theatre
  * Date
* View detailed movie information
* View cast and director information
* Watch trailer previews
* Explore movies currently screening and upcoming releases

### 🍿 Bollywood & Hollywood Showcase

The homepage includes dedicated cinematic showcases for both industries.

#### 🇺🇸 Hollywood

* **Interstellar Odyssey: Beyond the Horizon** — ⭐ 9.1/10
* **Kingdom of Aethelgard: The Iron Crown** — ⭐ 8.9/10
* **Shadows in the Mist: Neo-Noir** — ⭐ 8.7/10
* **Echoes of the Blue Note** — ⭐ 8.6/10
* **Cyber Strike: Zero Hour Protocol** — ⭐ 8.4/10
* **Chronicles of the Deep Cosmos** — ⭐ 9.3/10

#### 🇮🇳 Bollywood

* **Kalki 2898 AD: The Rebirth** — ⭐ 9.0/10
* **Jawan: The Final Reckoning** — ⭐ 8.9/10
* **Brahmāstra: Part Two - Dev** — ⭐ 8.8/10
* **Fighter: Sky Warriors** — ⭐ 8.6/10
* **Stree 2: Sarkate Ka Aatank** — ⭐ 8.5/10
* **Singham Again: Roar of Justice** — ⭐ 8.3/10

> **Note:** Movie names, ratings, and showcase data in the demo catalog are application data used for demonstration purposes.

---

## 🎟️ Real-Time Seat Booking

IMovies provides an interactive cinema seating experience.

### Seat Features

* Curved auditorium screen layout
* Standard seats
* Premium seats
* VIP recliner seats
* Live seat availability
* Reserved/occupied seat indicators
* Temporary seat locking
* Automatic seat release
* Real-time synchronization across clients

### ⏱️ 8-Minute Seat Hold

When a user selects a seat, it is temporarily held for **8 minutes**.

If payment is not completed within the hold period:

```text
Selected Seat
     ↓
Temporary Hold
     ↓
8-Minute Countdown
     ↓
Payment Completed? ── Yes → Confirm Booking
          │
          No
          ↓
Release Seat
          ↓
Available Again
```

This mechanism helps prevent two users from purchasing the same seat simultaneously.

---

## 💳 Payment & Checkout

The checkout system provides a complete cinema purchase workflow.

### Supported Demo Payment Methods

* Credit/Debit Card
* Apple Pay
* Google Pay
* UPI

### Checkout Features

* Ticket pricing
* Concession/snack selection
* Taxes
* Booking fees
* Itemized invoice
* Payment status
* Booking confirmation

### 🍿 Cinema Concessions

Users can add cinema snacks during checkout, including:

* Artisan Popcorn
* Loaded Nachos
* Angus Beef Hot Dogs
* Fountain Sodas
* ICEE Slushies
* Treat Combos

---

## 🎫 Digital Cinema Pass

After a successful booking, users receive a digital cinema ticket.

The pass includes:

* Movie name
* Theatre
* Hall number
* Showtime
* Date
* Selected seats
* Booking information
* QR entry code
* Barcode

The ticket also provides a **print-friendly layout** suitable for PDF export.

---

## 🔄 Booking Management

Users can manage their complete booking history from their account.

### Booking Features

* View upcoming bookings
* View previous bookings
* View ticket details
* Access digital passes
* Print tickets
* Download ticket layouts
* Cancel bookings
* Automatic seat release after cancellation
* Automated refund calculation

The cancellation workflow calculates a **90% refund** for eligible cancellations.

---

# 👤 Authentication & Security

IMovies implements secure authentication and authorization.

### Authentication

* User registration
* User login
* JWT authentication
* Password hashing with bcrypt.js
* Protected API routes
* Secure authentication middleware

### Role-Based Access Control

Two primary roles are supported:

```text
User
 ├── Browse movies
 ├── Select shows
 ├── Book seats
 ├── Make payments
 ├── View bookings
 └── Cancel bookings

Admin
 ├── Manage movies
 ├── Manage theatres
 ├── Manage shows
 ├── Manage schedules
 ├── View bookings
 └── View business analytics
```

### Security Features

* JWT-based authorization
* bcrypt password hashing
* Protected routes
* Role-based middleware
* API validation
* Authentication rate limiting
* Booking endpoint rate limiting
* Unauthorized-access prevention
* Centralized error handling

---

# 🛠️ Admin Management Console

The Admin Hub provides tools for cinema administrators to manage the platform.

### Movie Management

Administrators can:

* Add movies
* Edit movies
* Delete movies
* Update movie ratings
* Set genres
* Set languages
* Assign industry classification
* Manage movie metadata

### Showtime Management

Administrators can:

* Create showtimes
* Assign movies to theatres
* Select auditorium/hall
* Configure show dates
* Configure show timings
* Set seat pricing
* Manage seat categories

### Supported Cinema Formats

* IMAX Laser
* Dolby Atmos
* 4DX

### 📊 Business Analytics

The admin dashboard provides information such as:

* Gross revenue
* Ticket sales
* Venue occupancy
* Booking statistics
* Booking logs
* Cinema performance

---

# 🏗️ System Architecture

IMovies follows a **client-server architecture** based on the MERN stack.

```text
                    ┌─────────────────────┐
                    │      React.js       │
                    │    Frontend UI      │
                    └──────────┬──────────┘
                               │
                         REST API / HTTP
                               │
                    ┌──────────▼──────────┐
                    │     Express.js      │
                    │    Backend Server    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │       Node.js       │
                    │ Application Runtime │
                    └──────────┬──────────┘
                               │
                         Mongoose ODM
                               │
                    ┌──────────▼──────────┐
                    │      MongoDB        │
                    │    Data Storage     │
                    └─────────────────────┘
```

Real-time functionality is supported through live seat synchronization and socket-based communication.

---

# 🗄️ Database Design

MongoDB is used as the primary database.

### Collections

```text
Users
Movies
Theatres
Shows
Seats
Bookings
Payments
Notifications
```

### Basic Relationship

```text
User
 │
 └── Booking
       │
       ├── Movie
       ├── Show
       │     └── Theatre
       └── Seats
```

A booking connects a user with a specific movie show and selected seats.

Show documents contain information about:

* Theatre
* Auditorium
* Movie
* Date
* Time
* Seat pricing
* Seat availability

---

# 💻 Technology Stack

## Frontend

| Technology              | Purpose             |
| ----------------------- | ------------------- |
| HTML5                   | Page structure      |
| CSS3                    | Styling             |
| JavaScript              | Application logic   |
| React.js                | Frontend framework  |
| Redux                   | State management    |
| React Router            | Client-side routing |
| Axios                   | API communication   |
| Bootstrap / Material UI | UI components       |
| React Toastify          | Notifications       |

## Backend

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | Server runtime            |
| Express.js | Backend framework         |
| Mongoose   | MongoDB ODM               |
| JWT        | Authentication            |
| bcrypt.js  | Password hashing          |
| CORS       | Cross-origin requests     |
| dotenv     | Environment configuration |
| Multer     | File handling             |
| Socket.IO  | Real-time communication   |

## Database

* MongoDB

## Development Tools

* Git
* GitHub
* Postman
* npm

---

# 📁 Project Structure

A typical project structure is organized as follows:

```text
IMovies/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx
│   │   ├── AuthModal.tsx
│   │   ├── HeroBanner.tsx
│   │   ├── MovieCard.tsx
│   │   ├── MovieDetailsModal.tsx
│   │   ├── MovieFilters.tsx
│   │   ├── Navbar.tsx
│   │   ├── SeatBookingModal.tsx
│   │   ├── TheatresView.tsx
│   │   ├── TicketPassModal.tsx
│   │   ├── ToastContainer.tsx
│   │   └── UserBookingsModal.tsx
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── server/
│   │   └── db.ts
│   │
│   ├── types/
│   │   └── cinema.ts
│   │
│   ├── App.tsx
│   └── index.css
│
├── server.ts
├── package.json
├── index.html
├── .env
└── README.md
```

---

# ⚙️ Installation & Setup

## Prerequisites

Make sure the following are installed:

* Node.js **v16 or higher**
* npm
* MongoDB
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/imovies.git
cd imovies
```

Replace the repository URL with your actual GitHub repository URL.

---

## 2. Install Dependencies

Install the project dependencies:

```bash
npm install
```

If the frontend and backend are separated into different directories, install dependencies in both:

```bash
cd client
npm install

cd ../server
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the appropriate project directory.

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Example

```env
MONGODB_URI=mongodb://localhost:27017/imovies
JWT_SECRET=your_secure_secret_key
PORT=5000
```

> Never commit your `.env` file or expose your JWT secret publicly.

---

## 4. Start MongoDB

Make sure your MongoDB server is running.

For a local MongoDB installation:

```bash
mongod
```

---

## 5. Start the Application

Start the development server:

```bash
npm run dev
```

Or, depending on the project configuration:

```bash
npm start
```

The application will normally be available at:

```text
http://localhost:3000
```

and the backend API at:

```text
http://localhost:5000
```

---

# 🔌 API Architecture

The backend exposes RESTful APIs for the major application modules.

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Movies

```text
GET    /api/movies
GET    /api/movies/:id
POST   /api/movies
PUT    /api/movies/:id
DELETE /api/movies/:id
```

### Shows

```text
GET    /api/shows
POST   /api/shows
PUT    /api/shows/:id
DELETE /api/shows/:id
```

### Bookings

```text
GET  /api/bookings
POST /api/bookings
GET  /api/bookings/:id
PUT  /api/bookings/:id
DELETE /api/bookings/:id
```

### Payments

```text
POST /api/payments
GET  /api/payments/:id
```

> API routes may vary depending on the final backend implementation.

---

# 🔄 Application Workflow

```text
User Opens IMovies
        │
        ▼
Browse Movies
        │
        ▼
Search / Filter
        │
        ▼
Select Movie
        │
        ▼
Choose Theatre & Showtime
        │
        ▼
Select Seats
        │
        ▼
Seats Temporarily Locked
        │
        ▼
Add Concessions
        │
        ▼
Checkout & Payment
        │
        ▼
Booking Confirmed
        │
        ▼
Digital Cinema Pass
        │
        ▼
Scan QR at Theatre
```

---

# 🧪 Testing & Validation

The application should be tested across the following areas:

### Authentication

* User registration
* User login
* Invalid credentials
* JWT validation
* Protected routes
* Admin authorization

### Movie Management

* Movie creation
* Movie updates
* Movie deletion
* Search
* Filtering
* Pagination

### Booking

* Seat selection
* Seat availability
* Seat locking
* Seat expiration
* Duplicate booking prevention
* Booking confirmation
* Booking cancellation

### Payment

* Successful payment
* Failed payment
* Invoice generation
* Booking confirmation

### UI

* Responsive layouts
* Navigation
* Modal workflows
* Toast notifications
* Mobile compatibility
* Admin dashboard

Postman can be used to test backend APIs.

---

# ⚡ Performance & Optimization

The platform is designed with scalability and performance in mind.

### Database Optimization

Indexes can be added for:

* Movie search
* Movie genre
* Movie language
* Show filtering
* Theatre lookup
* Booking history
* Seat availability

### Application Optimization

* Pagination for movie listings
* Pagination for booking logs
* Centralized error handling
* API rate limiting
* Service/controller separation
* Reusable React components
* Efficient database queries
* Real-time seat synchronization

---

# 📊 Project Statistics

| Category          | Details                          |
| ----------------- | -------------------------------- |
| Architecture      | Client-Server                    |
| Stack             | MERN                             |
| Total Epics       | 6                                |
| Total Tasks       | 19                               |
| Subtasks          | 0                                |
| Database          | MongoDB                          |
| Authentication    | JWT                              |
| Password Security | bcrypt.js                        |
| Real-Time Engine  | Socket.IO / Live Synchronization |
| Frontend          | React.js                         |
| Backend           | Node.js + Express.js             |

---

# 🎯 Learning Outcomes

By developing IMovies, developers gain practical experience in:

* Full-stack MERN development
* React component architecture
* REST API development
* MongoDB database design
* Authentication with JWT
* Password hashing with bcrypt
* Role-based authorization
* Real-time application development
* Cinema seat management
* Booking and transaction workflows
* Payment integration concepts
* Admin dashboard development
* API testing
* Responsive UI development
* Database optimization
* Production-oriented backend architecture

---

# 🚀 Future Enhancements

Potential future improvements include:

* Integration with real payment gateways
* Email booking confirmations
* SMS ticket notifications
* Google OAuth authentication
* Advanced recommendation engine
* AI-powered movie recommendations
* Multi-language UI
* Theatre-specific offers
* Loyalty/reward points
* Coupon and promotional code system
* Dynamic pricing
* Advanced analytics dashboards
* QR-code scanning through mobile devices
* Docker deployment
* CI/CD pipeline
* Cloud deployment
* Automated testing

---

# 🔐 Environment & Security

For production deployment:

* Store secrets in environment variables
* Never commit `.env`
* Use HTTPS
* Use secure JWT configuration
* Configure CORS properly
* Add request validation
* Enable production-grade rate limiting
* Sanitize database queries
* Use secure HTTP headers
* Keep dependencies updated

Add `.env` to `.gitignore`:

```gitignore
node_modules/
.env
dist/
build/
*.log
```

---

# 🌐 Deployment

The application can be deployed using services such as:

### Frontend

* Vercel
* Netlify

### Backend

* Render
* Railway
* AWS
* Azure

### Database

* MongoDB Atlas

A typical production architecture:

```text
                Internet
                    │
          ┌─────────▼─────────┐
          │   React Frontend  │
          │  Vercel / Netlify │
          └─────────┬─────────┘
                    │
                  HTTPS
                    │
          ┌─────────▼─────────┐
          │ Express + Node.js │
          │ Backend / API     │
          └─────────┬─────────┘
                    │
          ┌─────────▼─────────┐
          │   MongoDB Atlas   │
          │     Database      │
          └───────────────────┘
```

---

# 🤝 Contributing

Contributions are welcome!

### Steps

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Make your changes
4. Commit your changes

```bash
git commit -m "Add new feature"
```

5. Push the branch

```bash
git push origin feature/new-feature
```

6. Open a Pull Request

---


# 👨‍💻 Project Information

**Project:** IMovies — Cinema Booking & Management System
**Architecture:** Client-Server
**Technology:** MERN Stack
**Database:** MongoDB
**Frontend:** React.js
**Backend:** Node.js + Express.js
**Authentication:** JWT + bcrypt.js
**Real-Time:** Socket.IO / Live Seat Synchronization

**Mentor:** No mentor assigned yet

---

# ⭐ Show Your Support

If you found this project useful or interesting, consider giving the repository a ⭐ on GitHub!

**IMovies — Browse. Book. Watch. Enjoy. 🎬🍿**
