# User CRUD API Documentation

This document describes the User CRUD (Create, Read, Update, Delete) API endpoints implemented in the acquisitions application.

## Authentication

All user endpoints require authentication via JWT token. The token can be provided in two ways:
1. As a cookie named `token` (automatically set after login)
2. As a Bearer token in the Authorization header: `Authorization: Bearer <token>`

## Authorization Levels

- **User**: Can access and modify their own information only
- **Admin**: Can access and modify any user's information

## Base URL

```
/api/users
```

## Endpoints

### 1. Get All Users

**GET** `/api/users`

Retrieves a list of all users in the system.

**Authorization**: Admin only

**Query Parameters** (optional):
- `page` (integer): Page number for pagination (default: 1)
- `limit` (integer): Number of users per page, max 100 (default: 10)
- `role` (string): Filter by role (`user` or `admin`)
- `search` (string): Search term for filtering users

**Response Example:**
```json
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Jane Admin",
      "email": "jane@example.com",
      "role": "admin",
      "created_at": "2024-01-16T14:20:00.000Z",
      "updated_at": "2024-01-16T14:20:00.000Z"
    }
  ],
  "count": 2
}
```

### 2. Get User by ID

**GET** `/api/users/:id`

Retrieves a specific user by their ID.

**Authorization**: 
- Users can retrieve their own information
- Admins can retrieve any user's information

**URL Parameters:**
- `id` (integer, required): User ID

**Response Example:**
```json
{
  "message": "User retrieved successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Update User

**PUT** `/api/users/:id`

Updates a user's information.

**Authorization**: 
- Users can update their own information (except role)
- Admins can update any user's information (including role)

**URL Parameters:**
- `id` (integer, required): User ID

**Request Body:**
At least one field must be provided for update.

```json
{
  "name": "Updated Name",           // optional, 2-255 characters
  "email": "new@example.com",       // optional, valid email, max 255 chars
  "password": "newpassword123",     // optional, 6-128 characters
  "role": "admin"                   // optional, "user" or "admin" (admin only)
}
```

**Response Example:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "name": "Updated Name",
    "email": "new@example.com",
    "role": "user",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-16T15:45:00.000Z"
  }
}
```

### 4. Delete User

**DELETE** `/api/users/:id`

Deletes a user from the system.

**Authorization**: 
- Users can delete their own account
- Admins can delete any user's account

**URL Parameters:**
- `id` (integer, required): User ID

**Response Example:**
```json
{
  "message": "User deleted successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Access token is required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You can only update your own information"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

## Example Usage

### 1. Get All Users (Admin)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Get Current User's Info
```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Update Current User's Name
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "New Name"
  }'
```

### 4. Admin Updates User Role
```bash
curl -X PUT http://localhost:3000/api/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "role": "admin"
  }'
```

### 5. Delete User Account
```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Validation Rules

### User ID
- Must be a positive integer
- Must exist in the database

### Name (optional for updates)
- 2-255 characters
- Trimmed of whitespace

### Email (optional for updates)
- Must be a valid email address
- Converted to lowercase
- Max 255 characters
- Must be unique across all users

### Password (optional for updates)
- 6-128 characters
- Automatically hashed before storage

### Role (optional for updates, admin only)
- Must be either "user" or "admin"
- Only administrators can modify roles

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **Role-based Authorization**: Different access levels for users and admins
3. **Self-access Control**: Users can only access/modify their own data (unless admin)
4. **Password Hashing**: Passwords are automatically hashed using bcrypt
5. **Input Validation**: All inputs are validated using Zod schemas
6. **SQL Injection Prevention**: Using Drizzle ORM with parameterized queries
7. **Rate Limiting**: Applied through Arcjet middleware

## Business Logic

1. **Email Uniqueness**: Each email can only be associated with one user
2. **Role Restrictions**: Only admins can change user roles
3. **Self-modification**: Users can modify their own information but not their role
4. **Admin Privileges**: Admins can modify any user's information including roles

## Database Schema

The user table includes the following fields:
- `id` (Primary Key): Auto-incrementing integer
- `name`: VARCHAR(256), NOT NULL
- `email`: VARCHAR(256), NOT NULL, UNIQUE
- `password`: VARCHAR(256), NOT NULL (hashed)
- `role`: VARCHAR(50), NOT NULL, DEFAULT 'user'
- `created_at`: TIMESTAMP, DEFAULT NOW()
- `updated_at`: TIMESTAMP, DEFAULT NOW()