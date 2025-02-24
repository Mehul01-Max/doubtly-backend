# Technical Requirements Document - Doubtly Backend

## 1. System Overview

### 1.1 Purpose

A platform where users can post technical doubts and get solutions from other users.

### 1.2 System Architecture

```
[Express Server] <-> [MongoDB]
         ↕
    [JWT Authentication]
```

## 2. Technology Stack

- Node.js
- Express.js
- MongoDB
- JWT for authentication
- bcrypt for password hashing

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
