<div align="center">

# ⚙️ KnitCivic — Server

### Powering Communities Behind the Scenes.

**KnitCivic Server** is the backend REST API for KnitCivic, a social event management platform. It handles event management, user authentication, community participation, saved events, and secure communication between the client and database.

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-Authentication-111827?style=for-the-badge)](https://www.better-auth.com/)
[![JWT](https://img.shields.io/badge/JWT-Security-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<br/>

<img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,javascript" alt="Backend Technologies" />

</div>

---

## 📖 About the Server

The KnitCivic backend provides a structured REST API to support the platform's core functionality.

It connects the frontend application with MongoDB, processes client requests, manages event-related operations, and handles authentication and authorization.

**Built with performance, security, and maintainability in mind.**

## 🚀 Core Features

- **🔐 Authentication & Authorization** — Secure authentication using Better Auth and JWT-based token verification for protected API routes.
- **📅 Event Management** — Create, retrieve, update, and delete community events with organized database operations.
- **🤝 Event Participation** — Manage event joining and participation records to connect community members with activities.
- **❤️ Saved Events** — Allow authenticated users to bookmark events and manage their saved event collections.
- **👤 User & Community Management** — Handle user-related information, event ownership, and community activity tracking.

## 🛠️ Technology Stack

| Technology  | Description                                     |
| ----------- | ----------------------------------------------- |
| Node.js     | JavaScript runtime environment                  |
| Express.js  | Backend REST API framework                      |
| MongoDB     | NoSQL database                                  |
| Better Auth | Authentication and session management           |
| JWT         | Token-based authentication and API verification |
| JavaScript  | Server-side programming language                |

## ⚙️ Installation & Setup

### Prerequisites

Before getting started, make sure you have:

- Node.js installed.
- npm or yarn.
- MongoDB Atlas account or a local MongoDB instance.
- Git installed.

### 1. Clone the Repository

```bash
git clone YOUR_SERVER_REPOSITORY_URL
```

### 2. Navigate to Server Directory

```bash
cd knit-civic-server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:3000
```

Configure additional Better Auth environment variables if your authentication implementation requires them.

**Important:** Never commit your `.env` file or expose private credentials in your repository.

### 5. Run the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The backend server will run at:

```text
http://localhost:8000
```

## 🔐 Authentication & Security

KnitCivic uses Better Auth and JWT to handle authentication and secure API communication.

Key security considerations:

- Better Auth manages user authentication and sessions.
- JWT verification protects authorized API endpoints.
- Protected routes validate incoming authentication tokens.
- User-specific operations require appropriate authorization.
- Environment variables protect sensitive credentials.

## 🌐 API Endpoints

The following table illustrates the main API endpoint structure. Adjust HTTP methods and paths to match your actual Express routes.

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| GET    | `/events`          | Get all events     |
| GET    | `/events/:id`      | Get event details  |
| GET    | `/recentevents`    | Get recent events  |
| POST   | `/events`          | Create a new event |
| PATCH  | `/events/:id`      | Update an event    |
| DELETE | `/events/:id`      | Delete an event    |
| POST   | `/events/:id/join` | Join an event      |
| GET    | `/join-event`      | Get saved events   |
| POST   | `/join-event`      | Save an event      |

<sub>Authentication and authorization requirements depend on the individual endpoint.</sub>

## 🗄️ Database

KnitCivic uses **MongoDB** to store and manage application data.

The database supports:

- User-related information.
- Community events.
- Event participation records.
- Saved events.
- Event ownership and activity data.

MongoDB collections are organized to support efficient data retrieval and management.

## 🔄 Application Workflow

```text
             CLIENT
               |
               v
        Express REST API
               |
               v
       Authentication Check
          Better Auth / JWT
               |
               v
        Route & Middleware
               |
               v
          Controllers
               |
               v
            MongoDB
               |
               v
         JSON Response
               |
               v
             CLIENT
```

## 🚧 Future Improvements

- Advanced API validation and error handling.
- Event search, filtering, and pagination.
- Real-time event notifications.
- Rate limiting and API security improvements.
- Automated API testing and documentation.

## 🤝 Contributing

Contributions and suggestions are welcome!

1. Fork this repository.
2. Create a feature branch.
3. Implement your changes.
4. Commit your changes.
5. Submit a Pull Request.

## 📌 Related Project

**KnitCivic Client** — The frontend application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and HeroUI.

[View Frontend Repository](https://github.com/kamrulcode/knit-civic-client)

---

<div align="center">

### ⚙️ KnitCivic Server

**Connecting Technology with Community Impact.**

Built with ❤️ using Node.js, Express & MongoDB.

<sub>© 2026 KnitCivic. All Rights Reserved.</sub>

</div>
