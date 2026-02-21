# CP Sheet

CP Sheet is a competitive programming tracking application built with Express and EJS. It features user authentication, progress tracking, and sheet management.

## Features

- **User Authentication**: Secure Signup and Login with JWT (Access & Refresh Tokens).
- **Session Management**: HttpOnly cookies for secure token storage.
- **Dynamic Views**: Server-rendered pages using EJS.
- **Global Error Handling**: Standardized JSON error responses.
- **Responsive UI**: Glassmorphism design with mobile support.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Templating**: EJS
- **Authentication**: JWT (jsonwebtoken), bcrypt, cookie-parser

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Set up Environment Variables**:
    Create a `.env` file in the root directory with the following:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    ACCESS_TOKEN_SECRET=your_access_token_secret
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    REFRESH_TOKEN_EXPIRY=10d
    ```

	or, Directly copy the `.env.example` file content.

3.  **Start the server**:
    ```bash
    npm run dev
    ```

4.  **Open the app**:
    - [http://localhost:3000](http://localhost:3000)

## Routes

### Pages
- `/` - Home Page (Login/Signup/Logout buttons based on auth state)
- `/login` - User Login Page
- `/signup` - User Registration Page
- `/sheet` - CP Sheet Page (Protected)

### APIs (`/api/v1/users`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh-token` - Refresh access token
- `POST /change-password` - Change current password
- `PATCH /update-account` - Update account details
- `GET /current-user` - Get current user details

## Project Structure

```
.
├── public/              # Static assets (css, images)
├── src/
│   ├── app.js           # Express app configuration
│   ├── index.js         # Entry point
│   ├── db/              # Database connection
│   ├── models/          # Mongoose models (User, etc.)
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth and Error middlewares
│   ├── utils/           # Utility classes (ApiError, ApiResponse)
│   └── views/           # EJS templates
└── .env                 # Environment variables
```
