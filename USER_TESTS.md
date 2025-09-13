# User CRUD API Testing Guide

This document provides examples of how to test the User CRUD API endpoints using various tools.

## Prerequisites

1. Start the application:
   ```bash
   npm run dev
   # or
   docker-compose --env-file .env.development -f docker-compose.dev.yml up -d
   ```

2. Create a test user and get authentication tokens:
   ```bash
   # Register a regular user
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123",
       "role": "user"
     }'

   # Register an admin user
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin User",
       "email": "admin@example.com",
       "password": "password123",
       "role": "admin"
     }'
   ```

3. Login to get tokens (save the returned JWT tokens):
   ```bash
   # Login as regular user
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'

   # Login as admin
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "password123"
     }'
   ```

## Test Cases

Replace `USER_TOKEN` and `ADMIN_TOKEN` with actual JWT tokens from login responses.

### 1. Test Get All Users (Admin Only)

**Should succeed with admin token:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Should fail with user token (403 Forbidden):**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer USER_TOKEN"
```

**Should fail without token (401 Unauthorized):**
```bash
curl -X GET http://localhost:3000/api/users
```

### 2. Test Get User by ID

**User gets their own info (should succeed):**
```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer USER_TOKEN"
```

**User tries to get another user's info (should fail - 403 Forbidden):**
```bash
curl -X GET http://localhost:3000/api/users/2 \
  -H "Authorization: Bearer USER_TOKEN"
```

**Admin gets any user's info (should succeed):**
```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Invalid user ID (should fail - 404 Not Found):**
```bash
curl -X GET http://localhost:3000/api/users/999 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Invalid ID format (should fail - 400 Bad Request):**
```bash
curl -X GET http://localhost:3000/api/users/abc \
  -H "Authorization: Bearer USER_TOKEN"
```

### 3. Test Update User

**User updates their own name (should succeed):**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "name": "Updated Test User"
  }'
```

**User tries to update their role (should be ignored/removed):**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "name": "Test User 2",
    "role": "admin"
  }'
```

**Admin updates user role (should succeed):**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "role": "admin"
  }'
```

**User tries to update another user (should fail - 403 Forbidden):**
```bash
curl -X PUT http://localhost:3000/api/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "name": "Unauthorized Update"
  }'
```

**Invalid email format (should fail - 400 Bad Request):**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "email": "invalid-email"
  }'
```

**Empty update body (should fail - 400 Bad Request):**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{}'
```

**Password too short (should fail - 400 Bad Request):**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "password": "123"
  }'
```

### 4. Test Delete User

**User deletes their own account (should succeed):**
```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer USER_TOKEN"
```

**Admin deletes any user (should succeed):**
```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**User tries to delete another user (should fail - 403 Forbidden):**
```bash
curl -X DELETE http://localhost:3000/api/users/2 \
  -H "Authorization: Bearer USER_TOKEN"
```

**Delete non-existent user (should fail - 404 Not Found):**
```bash
curl -X DELETE http://localhost:3000/api/users/999 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Validation Tests

### Test Email Uniqueness

1. Create first user:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "First User",
    "email": "unique@example.com",
    "password": "password123"
  }'
```

2. Try to update another user with the same email (should fail - 409 Conflict):
```bash
curl -X PUT http://localhost:3000/api/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "email": "unique@example.com"
  }'
```

### Test Input Validation

**Name too short:**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "name": "A"
  }'
```

**Name too long:**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "name": "'$(python3 -c "print('A' * 256)")"
  }'
```

**Invalid role:**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "role": "superuser"
  }'
```

## Using Postman

You can also test these endpoints using Postman:

1. Create a new collection called "User CRUD API"
2. Set up environment variables:
   - `base_url`: `http://localhost:3000`
   - `user_token`: (set after login)
   - `admin_token`: (set after admin login)

3. Create requests for each endpoint:
   - Method: GET, URL: `{{base_url}}/api/users`
   - Headers: `Authorization: Bearer {{admin_token}}`

## Expected Response Status Codes

| Scenario | Expected Status |
|----------|----------------|
| Successful operation | 200 OK |
| User not found | 404 Not Found |
| Validation error | 400 Bad Request |
| Unauthorized (no token) | 401 Unauthorized |
| Forbidden (wrong permissions) | 403 Forbidden |
| Email already exists | 409 Conflict |
| Server error | 500 Internal Server Error |

## Testing with Jest (Optional)

If you want to add automated tests, here's a sample Jest test structure:

```javascript
// tests/users.test.js
describe('User CRUD API', () => {
  let userToken, adminToken;
  
  beforeAll(async () => {
    // Setup test users and get tokens
  });

  describe('GET /api/users', () => {
    test('should return all users for admin', async () => {
      // Test implementation
    });
    
    test('should return 403 for regular user', async () => {
      // Test implementation
    });
  });

  describe('GET /api/users/:id', () => {
    // Add more tests
  });

  // Add more test suites
});
```

## Cleanup

After testing, you can clean up test data by deleting test users or resetting the database.