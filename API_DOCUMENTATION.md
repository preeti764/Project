# Alumni Portal - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Authentication Routes (`/auth`)

### Register
- **Endpoint**: `POST /auth/register`
- **Auth**: No
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student|alumni",
    "company": "Google (required for alumni)",
    "designation": "Senior Engineer (required for alumni)"
  }
  ```
- **Response**: `{ token, user }`

### Login
- **Endpoint**: `POST /auth/login`
- **Auth**: No
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123",
    "role": "student|alumni (optional)"
  }
  ```
- **Response**: `{ token, user }`

### Get Current User
- **Endpoint**: `GET /auth/me`
- **Auth**: Required
- **Response**: `{ user }`

### Update Profile
- **Endpoint**: `PUT /auth/profile`
- **Auth**: Required
- **Body**:
  ```json
  {
    "availableForMentorship": true (alumni only)
  }
  ```
- **Response**: `{ user }`

---

## Mentors Routes (`/mentors`)

### List Available Mentors
- **Endpoint**: `GET /mentors`
- **Auth**: Required
- **Response**: `{ mentors: [...] }`

---

## Jobs Routes (`/jobs`)

### Get All Jobs
- **Endpoint**: `GET /jobs`
- **Auth**: Required
- **Response**: `{ jobs: [...] }`

### Get Job Details
- **Endpoint**: `GET /jobs/:id`
- **Auth**: Required
- **Response**: `{ job }`

### Get My Jobs (Alumni Only)
- **Endpoint**: `GET /jobs/mine`
- **Auth**: Required (Alumni)
- **Response**: `{ jobs: [...] }`

### Post a Job (Alumni Only)
- **Endpoint**: `POST /jobs`
- **Auth**: Required (Alumni)
- **Body**:
  ```json
  {
    "title": "Software Engineer Intern",
    "company": "Google",
    "jobType": "internship|full-time|part-time",
    "description": "Description of the job..."
  }
  ```
- **Response**: `{ job, message }`

### Update Job (Alumni Only)
- **Endpoint**: `PUT /jobs/:id`
- **Auth**: Required (Alumni)
- **Body**: Same as POST (any field can be updated)
- **Response**: `{ message, job }`

### Delete Job (Alumni Only)
- **Endpoint**: `DELETE /jobs/:id`
- **Auth**: Required (Alumni)
- **Response**: `{ message }`

### Apply to Job (Students Only)
- **Endpoint**: `POST /jobs/:id/apply`
- **Auth**: Required (Student)
- **Response**: `{ message }`

---

## Mentorship Routes (`/mentorship`)

### Send Mentorship Request
- **Endpoint**: `POST /mentorship/request`
- **Auth**: Required (Student)
- **Body**:
  ```json
  {
    "alumniId": "userid",
    "message": "Why I want mentorship (optional)"
  }
  ```
- **Response**: `{ id, message }`

### Get Mentorship Requests
- **Endpoint**: `GET /mentorship/requests`
- **Auth**: Required
- **Response**: 
  - Students: See requests they sent
  - Alumni: See requests they received
  ```json
  { requests: [...] }
  ```

### Respond to Mentorship Request (Alumni Only)
- **Endpoint**: `PUT /mentorship/requests/:id`
- **Auth**: Required (Alumni)
- **Body**:
  ```json
  {
    "status": "accepted|declined"
  }
  ```
- **Response**: `{ message }`

---

## Forum Routes (`/forum`)

### Get All Forum Posts
- **Endpoint**: `GET /forum`
- **Auth**: Required
- **Response**: `{ posts: [...] }`

### Get Forum Post Details
- **Endpoint**: `GET /forum/:id`
- **Auth**: Required
- **Response**: `{ post }`

### Create Forum Post
- **Endpoint**: `POST /forum`
- **Auth**: Required
- **Body**:
  ```json
  {
    "title": "Post title",
    "content": "Post content..."
  }
  ```
- **Response**: `{ post, message }`

### Update Forum Post
- **Endpoint**: `PUT /forum/:id`
- **Auth**: Required (Post owner)
- **Body**: Same as POST (any field can be updated)
- **Response**: `{ message, post }`

### Delete Forum Post
- **Endpoint**: `DELETE /forum/:id`
- **Auth**: Required (Post owner)
- **Response**: `{ message }`

---

## Error Responses

### 400 Bad Request
```json
{ "message": "Validation error description" }
```

### 401 Unauthorized
```json
{ "message": "Authentication required" }
```

### 403 Forbidden
```json
{ "message": "Access denied - role not allowed" }
```

### 404 Not Found
```json
{ "message": "Resource not found" }
```

### 409 Conflict
```json
{ "message": "Resource already exists" }
```

### 500 Internal Server Error
```json
{ "message": "Internal server error" }
```

---

## User Roles

- **Student**: Can browse mentors, apply to jobs, request mentorship, post forum messages
- **Alumni**: Can post jobs, accept/decline mentorship requests, post forum messages

---

## Environment Variables

Backend (.env):
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

Frontend (.env):
```
VITE_API_URL=http://localhost:5000/api
```
