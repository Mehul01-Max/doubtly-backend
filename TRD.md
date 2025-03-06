# Technical Requirements Document - Doubtly Backend

## Project Overview

The College Doubt-Solving Platform is a web application designed to facilitate peer-to-peer learning by allowing students to post academic doubts and receive answers from fellow students. The system incentivizes participation through a points-based reward system, where students earn points for solving doubts. These points can be converted into Scaler Coins, which can be used to purchase college merchandise. A leaderboard will showcase top contributors, fostering a competitive and engaging learning environment.

## Key Features

1. User Authentication
   Students can sign up and log in using their college email.
   Profile management with details like name, department, and accumulated points.
2. Doubt Posting & Answering
   Students can post doubts under different categories (subjects, topics, etc.).
   Other students can provide answers with explanations.
   Answer upvoting system to determine the best response.
3. Reward System
   Points awarded for answering doubts based on upvotes and accuracy.
   Points can be redeemed for Scaler Coins.
   Scaler Coins can be used to purchase college merchandise.
4. Leaderboard
   Displays top students based on accumulated points.
   Filters for different time periods (weekly, monthly, all-time).
5. Moderation & Reporting
   Users can report inappropriate content.
   Admin panel for moderating flagged doubts and answers.
6. Search & Filtering
   Search doubts by keyword.
   Filter by subject, difficulty level, and status (unanswered/answered).

## Technology Stack

Frontend: React

Backend: Node.js with Express

Database: MongoDB

Authentication: Firebase Auth / OAuth (Google)

Hosting: Backend is hosted on Onrender and frontend in Vercel

## Evaluation & Success Metrics

Number of doubts posted and answered.

Engagement level (upvotes, comments, participation rate).

Conversion rate of points to Scaler Coins.

Student satisfaction through feedback surveys.

## 1. System Overview

### 1.2 System Architecture

```
[React Frontend] <-> [Express Server] <-> [MongoDB]
        ↕                  ↕
[JWT Authentication]   [Business Logic]
        ↕                  ↕
  [React Router]      [REST API Endpoints]
        ↕                  ↕
[State Management]  [Middleware (e.g., Auth, Validation)]
        ↕                  ↕
[UI Components]    [Third-Party Services (e.g., Payment, Email)]

```

## 3. Database Schema

### Users Collection

```javascript
{
    _id: ObjectId,
    name: String,
    email: String,
    password: String(hashed),
    points: Number
}
```

### Doubts Collection

```javascript
{
    _id: ObjectId,
    userID: String,
    heading: String,
    description: String,
    type: String(enum: ["frontend", "backend", "dsa", "maths", "ai/ml"]),
    status: Boolean,
    addDate: Date,
    modifiedDate: Date
}
```

### Solutions Collection

```javascript
{
    _id: ObjectId,
    doubtID: String,
    userID: String,
    solution: String,
    addDate: Date,
    modifiedDate: Date,
    status: String(enum: ["pending", "correct", "wrong"])
}
```

## 4. API Endpoints

### Authentication

- POST `/api/auth/signup`: Register new user
- POST `/api/auth/signin`: Login user

### Doubts

- POST `/api/doubt/add`: Create new doubt
- PUT `/api/doubt/modify/:doubtId`: Update doubt
- DELETE `/api/doubt/delete/:doubtId`: Delete doubt
- GET `/api/doubt/showAll`: Get all doubts
- GET `/api/doubt/show/:techStack`: Get doubts by tech stack
- GET `/api/doubt/show/id/:doubtId`: Get doubt by ID

### Solutions

- POST `/api/solution/add/:questionId`: Add solution
- PUT `/api/solution/modify/:solutionId`: Update solution
- DELETE `/api/solution/delete/:solutionId`: Delete solution
- GET `/api/solution/show/:questionId`: Get solutions for a doubt

## 5. Security Implementation

### Authentication

- JWT token-based authentication
- Token expiration: 1 hour
- Password requirements enforced (uppercase, lowercase, number, special character)
- Password hashing using bcrypt (10 rounds)

### Authorization

- Users can only modify/delete their own doubts
- Users can only modify/delete their own solutions

## 6. Error Handling

Current error responses include:

```javascript
{
  message: "specific error message";
}
```

Common error scenarios:

- Authentication failures
- Invalid input data
- Resource not found
- Unauthorized actions

## 7. Environment Requirements

Required environment variables:

```
MONGO_URI=mongodb_connection_string
JWT_SECRET=jwt_secret_key
```
