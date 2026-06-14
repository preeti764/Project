# AlumniConnect — MERN Stack Portal

Alumni–Student Interaction Portal built with MongoDB, Express, React, and Node.js.

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui, React Router |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs |
| Database | MongoDB Atlas |
| Auth | JWT (localStorage) |
| Styling | Tailwind CSS + Radix UI Components |

## Features

### For Students
- 🎯 Browse available mentors
- 📧 Send mentorship requests
- 💼 View job/internship postings from alumni
- 📋 Apply to jobs
- 💬 Participate in discussion forum
- 📊 Dashboard with mentorship & job stats

### For Alumni
- 👥 Available as mentor for students
- 💼 Post jobs and internship opportunities
- 📬 Manage mentorship requests (accept/decline)
- 💬 Share advice in discussion forum
- ⚙️ Toggle mentorship availability
- 📊 Dashboard with requests and job postings

### General
- 🔐 Secure JWT authentication
- 🎨 Responsive design (mobile-friendly)
- 🔔 Toast notifications
- 📱 Modern UI with Radix components

## Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

**Terminal 1:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your MongoDB URI and JWT_SECRET
npm run dev
```

Backend runs on: `http://localhost:5000`

**Environment Variables (backend/.env):**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your_super_secret_jwt_key_change_this
PORT=5000
NODE_ENV=development
```

### Frontend Setup

**Terminal 2:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if deploying (default localhost:5000 is fine for dev)
npm run dev
```

Frontend runs on: `http://localhost:5173`

**Environment Variables (frontend/.env):**
```
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
alumni-portal/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Job.js            # Job posting schema
│   │   ├── MentorshipRequest.js
│   │   └── ForumPost.js
│   ├── routes/
│   │   ├── auth.js           # Login, register, profile
│   │   ├── jobs.js           # Job CRUD
│   │   ├── mentors.js        # List mentors
│   │   ├── mentorship.js     # Mentorship requests
│   │   └── forum.js          # Forum posts CRUD
│   ├── middleware/
│   │   └── auth.js           # JWT & role verification
│   ├── server.js             # Express app entry
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ui/           # Radix UI components
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── AlumniDashboard.jsx
│   │   ├── api/
│   │   │   └── axios.js      # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── API_DOCUMENTATION.md   # Full API reference
├── README.md
└── package.json           # Root package (if monorepo setup)
```

## Routes & Pages

| Route | Role | Description |
|-------|------|-------------|
| `/` | Public | Landing page with overview |
| `/login` | Public | Login with role selector |
| `/register` | Public | Register (alumni requires company & designation) |
| `/student` | Student | Student dashboard |
| `/alumni` | Alumni | Alumni dashboard |

## API Endpoints Summary

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full details.

### Auth (`/api/auth`)
- `POST /register` - Create account
- `POST /login` - Login
- `GET /me` - Current user
- `PUT /profile` - Update profile

### Mentors (`/api/mentors`)
- `GET /` - List available mentors

### Jobs (`/api/jobs`)
- `GET /` - All jobs
- `GET /:id` - Job details
- `GET /mine` - My jobs (alumni)
- `POST /` - Post job (alumni)
- `PUT /:id` - Update job (alumni)
- `DELETE /:id` - Delete job (alumni)
- `POST /:id/apply` - Apply to job (student)

### Mentorship (`/api/mentorship`)
- `POST /request` - Send request (student)
- `GET /requests` - Get requests
- `PUT /requests/:id` - Respond to request (alumni)

### Forum (`/api/forum`)
- `GET /` - All posts
- `GET /:id` - Post details
- `POST /` - Create post
- `PUT /:id` - Update post (author)
- `DELETE /:id` - Delete post (author)

## Development Scripts

**Backend:**
```bash
npm run dev      # Start with hot reload (nodemon)
npm start        # Start production server
```

**Frontend:**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "student" | "alumni",
  company: String (alumni only),
  designation: String (alumni only),
  availableForMentorship: Boolean (alumni),
  createdAt: Date,
  updatedAt: Date
}
```

### Job
```javascript
{
  title: String,
  company: String,
  jobType: "internship" | "full-time" | "part-time",
  description: String,
  postedBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### MentorshipRequest
```javascript
{
  student: ObjectId (User),
  alumni: ObjectId (User),
  message: String,
  status: "pending" | "accepted" | "declined",
  createdAt: Date,
  updatedAt: Date
}
```

### ForumPost
```javascript
{
  author: ObjectId (User),
  title: String,
  content: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Deploy Backend (Render, Railway, Heroku)
1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables
4. Deploy

### Deploy Frontend (Vercel, Netlify)
1. Set `VITE_API_URL` to production backend URL
2. Deploy from GitHub

## Security Notes
- Passwords are hashed with bcryptjs (10 rounds)
- JWT tokens expire in 7 days
- Protected routes require valid JWT
- Role-based access control (RBAC)
- MongoDB passwords are URL-encoded

## Troubleshooting

**Backend won't start:**
- Check MongoDB connection string in `.env`
- Ensure `JWT_SECRET` is set
- Check if port 5000 is available

**Frontend can't connect to API:**
- Verify backend is running on http://localhost:5000
- Check CORS settings in server.js
- Ensure `VITE_API_URL` matches backend URL

**Login fails:**
- Verify email and password format
- Check database has user records
- Check JWT_SECRET matches between login and token verification

## Contributing
Feel free to fork, improve, and submit PRs!

## License
MIT


## API Routes

- `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
- `GET /api/mentors`
- `GET/POST /api/jobs` · `GET /api/jobs/mine` · `POST /api/jobs/:id/apply`
- `POST /api/mentorship/request` · `GET /api/mentorship/requests` · `PUT /api/mentorship/requests/:id`
- `GET/POST /api/forum`

## Project Structure

```
PROJECT_INTERNSHIP/
├── backend/
│   ├── server.js
│   ├── .env
│   ├── models/
│   ├── routes/
│   └── middleware/
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── api/
    └── package.json
```

## Design

Black & white theme only. Inter font. shadcn/ui components. Max container: `max-w-5xl mx-auto px-4`.

## License

MIT — Internship project
