# Doubt Solving Platform - Backend Documentation

This documentation outlines the API endpoints and their usage for the doubt solving platform's backend.

## Base URL

http://localhost:3000/api

## Authentication

### Sign Up

Create a new user account.

**Endpoint:** `POST /auth/signup`

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%\*?&)

**Response:**

- Success (200): `{ "message": "user created" }`
- Error (400):
  - If fields missing: `{ "message": "Name, Email and Password are required" }`
  - If email exists: `{ "message": "Email already exists" }`
  - If password weak: `{ "message": "Password must be at least 8 characters long..." }`

### Sign In

Login to get authentication token.

**Endpoint:** `POST /auth/signin`

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

- Success (200): `{ "token": "jwt_token", "message": "Login Successful" }`
- Error (400):
  - If fields missing: `{ "message": "email and password is required" }`
  - If email not found: `{ "message": "these email is not registered with us" }`
  - If wrong password: `{ "message": "invalid password" }`

## Doubts

All doubt endpoints require authentication token in headers: `{ "token": "jwt_token" }`

### Create Doubt

**Endpoint:** `POST /doubt/add`

**Request Body:**

```json
{
    "heading": "string",
    "description": "string",
    "type": "frontend" | "backend" | "dsa" | "maths" | "ai/ml"
}
```

**Response:**

- Success (200): `{ "message": "doubt created" }`
- Error (400): `{ "message": "heading, description and type are required" }`

### Modify Doubt

**Endpoint:** `PUT /doubt/modify/:id`

**Request Body:**

```json
{
    "heading": "string",
    "description": "string",
    "type": "frontend" | "backend" | "dsa" | "maths" | "ai/ml"
}
```

**Response:**

- Success (200): `{ "message": "doubt modified" }`
- Error (400):
  - If not author: `{ "message": "You are not allowed to modify this question..." }`
  - If fields missing: `{ "message": "heading, description and type are required" }`

### Delete Doubt

**Endpoint:** `DELETE /doubt/delete/:id`

**Response:**

- Success (200): `{ "message": "doubt deleted" }`
- Error (400): `{ "message": "You are not allowed to delete this question..." }`

### Get All Doubts

**Endpoint:** `GET /doubt/showAll`

**Response:**

- Success (200): `{ "result": [array_of_doubts] }`

### Get Doubts by Tech Stack

**Endpoint:** `GET /doubt/show/:techStack`

**Response:**

- Success (200): `{ "result": [array_of_doubts] }`
- Error (404): `{ "message": "this doubt type doesn't exist" }`

### Get Doubt by ID

**Endpoint:** `GET /doubt/show/id/:id`

**Response:**

- Success (200): `{ "result": doubt_object }`
- Error: `{ "message": "not a valid doubt id" }`

## Solutions

All solution endpoints require authentication token in headers: `{ "token": "jwt_token" }`

### Add Solution

**Endpoint:** `POST /solution/add/:id`

**Request Body:**

```json
{
  "solution": "string"
}
```

**Response:**

- Success (200): `{ "message": "solution added" }`
- Error (400): `{ "message": "heading, description and type are required" }`

### Modify Solution

**Endpoint:** `PUT /solution/modify/:id`

**Request Body:**

```json
{
  "solution": "string"
}
```

**Response:**

- Success (200): `{ "message": "solution modified" }`
- Error (400):
  - If not author: `{ "message": "You are not allowed to modify this solution..." }`
  - If solution missing: `{ "message": "solution are required" }`

### Delete Solution

**Endpoint:** `DELETE /solution/delete/:id`

**Response:**

- Success (200): `{ "message": "solution deleted" }`
- Error (400): `{ "message": "You are not allowed to delete this solution..." }`

### Get Solutions for a Doubt

**Endpoint:** `GET /solution/show/:id`

**Response:**

- Success (200): `{ "result": [array_of_solutions] }`
- Error: `{ "message": "invalid id! no doubt with this id exists" }`

## Models

### User

```json
{
  "name": "string",
  "email": "string",
  "password": "string (hashed)",
  "points": "number"
}
```

### Doubt

```json
{
  "userID": "string",
  "heading": "string",
  "description": "string",
  "type": "string (enum)",
  "status": "boolean",
  "addDate": "Date",
  "modifiedDate": "Date"
}
```

### Solution

```json:Backend/README.md
{
    "doubtID": "string",
    "userID": "string",
    "solution": "string",
    "addDate": "Date",
    "modifiedDate": "Date",
    "status": "string (pending/correct/wrong)"
}
```

## Error Handling

All endpoints include error handling for:

- Authentication errors (401)
- Invalid input (400)
- Server errors (500)

For protected routes, always include the JWT token in the request headers:

```json
{
  "token": "your_jwt_token"
}
```

This README provides comprehensive documentation for frontend developers to understand and integrate with the backend API. It includes all endpoints, required request formats, expected responses, and error handling information.
# doubtly-backend
# doubtly-backend
