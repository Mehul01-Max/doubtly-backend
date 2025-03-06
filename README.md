# Doubtly - Backend API Documentation

A backend service for a doubt solving platform where users can post questions, provide solutions, and interact with technical content.

## Base URL

```
http://localhost:3000/api
```

## Authentication Headers

For all protected routes, include the Bearer token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Authentication

#### Register User

```http
POST /auth/signup
```

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass1@"
}
```

**Password Requirements:**

- Minimum 8 characters
- One uppercase letter
- One lowercase letter
- One number
- One special character (@$!%\*?&)

#### Login

```http
POST /auth/signin
```

**Body:**

```json
{
  "email": "john@example.com",
  "password": "StrongPass1@"
}
```

**Response:**

```json
{
  "token": "jwt_token_string",
  "message": "Login Successful"
}
```

### 2. Doubts

#### Create New Doubt

```http
POST /doubt/add
```

**Body:**

```json
{
  "heading": "How to implement JWT?",
  "description": "I'm trying to implement JWT in my Node.js application...",
  "type": "backend"
}
```

**Note:** Type must be one of: "frontend", "backend", "dsa", "maths", "ai/ml"

#### Get Doubts

- All doubts: `GET /doubt/showAll`
- By tech stack: `GET /doubt/show/:techStack`
- Single doubt: `GET /doubt/show/id/:doubtId`

#### Update Doubt

```http
PUT /doubt/modify/:doubtId
```

**Body:** Same as create doubt

#### Delete Doubt

```http
DELETE /doubt/delete/:doubtId
```

### 3. Solutions

#### Add Solution

```http
POST /solution/add/:questionId
```

**Body:**

```json
{
  "solution": "To implement JWT, first install jsonwebtoken package..."
}
```

#### Modify Solution

```http
PUT /solution/modify/:solutionId
```

**Body:**

```json
{
  "solution": "Updated solution content..."
}
```

#### Delete Solution

```http
DELETE /solution/delete/:solutionId
```

#### Get Solutions

```http
GET /solution/show/:questionId
```

## Data Models

### User

```javascript
{
    name: String,       // required
    email: String,      // required, unique
    password: String,   // required, hashed
    points: Number      // default: 0
}
```

### Doubt

```javascript
{
    userID: String,     // required
    heading: String,    // required
    description: String,// required
    type: String,      // required, enum: ["frontend", "backend", "dsa", "maths", "ai/ml"]
    status: Boolean,    // required
    addDate: Date,     // required
    modifiedDate: Date  // optional
}
```

### Solution

```javascript
{
    doubtID: String,    // required
    userID: String,     // required
    solution: String,   // required
    addDate: Date,      // required
    modifiedDate: Date, // optional
    status: String      // required, enum: ["pending", "correct", "wrong"]
}
```

## Error Responses

### Authentication Errors (401)

```json
{
  "message": "Authentication token required"
}
```

or

```json
{
  "message": "Invalid Authentication token"
}
```

### Validation Errors (400)

```json
{
  "message": "specific error message"
}
```

### Server Errors (500)

```json
{
  "message": "Internal server error"
}
```

## Environment Variables

Create a `.env` file with:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the server: `npm start`

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT for authentication
- bcrypt for password hashing
