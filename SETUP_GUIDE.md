# Setup Guide - Alumni Portal

## Prerequisites
- Node.js 16+ (check with `node --version`)
- npm 7+ or yarn
- Git
- A MongoDB Atlas account (free tier available)

## Step 1: Clone & Initial Setup

```bash
# Clone the repository (if applicable)
git clone <repo-url>
cd alumni-portal

# Install root dependencies (if applicable)
npm install
```

## Step 2: Backend Setup

### 2.1 Install Dependencies
```bash
cd backend
npm install
```

### 2.2 Create Environment File
```bash
# Copy the example to create your .env
cp .env.example .env
```

### 2.3 Configure MongoDB
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or log in
3. Create a new project
4. Create a cluster (free tier available)
5. Click "Connect" and select "Drivers"
6. Copy the connection string
7. Add your connection string to `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

### 2.4 Generate JWT Secret
Generate a secure random string for JWT:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:
```
JWT_SECRET=<your-generated-secret>
```

### 2.5 Test Backend
```bash
# Start the backend server
npm run dev
```

Should output:
```
MongoDB connected
Server running on http://localhost:5000
```

**Test the API:**
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}
```

## Step 3: Frontend Setup

### 3.1 Install Dependencies
```bash
cd ../frontend
npm install
```

### 3.2 Create Environment File
```bash
# Copy the example
cp .env.example .env
```

The default `.env` should work for local development:
```
VITE_API_URL=http://localhost:5000/api
```

### 3.3 Test Frontend
```bash
# Start the frontend server
npm run dev
```

Should output:
```
VITE v4.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Press h to show help
```

## Step 4: Test the Application

1. Open http://localhost:5173 in your browser
2. Click "Register" to create an account:
   - **For Student**: Just enter name, email, password
   - **For Alumni**: Enter name, email, password, company, designation
3. Fill in the form and submit
4. You should be redirected to your dashboard
5. Explore the features:
   - Students can browse mentors and jobs
   - Alumni can post jobs and see mentorship requests

## Troubleshooting

### Backend Issues

**"FATAL: MONGO_URI environment variable is not set"**
- Solution: Add `MONGO_URI` to your `.env` file

**"FATAL: JWT_SECRET environment variable is not set"**
- Solution: Add `JWT_SECRET` to your `.env` file

**"MongoDB connection failed"**
- Check your connection string in `.env`
- Verify your IP is whitelisted in MongoDB Atlas (Security → Network Access)
- Try clicking "Allow Access from Anywhere" (only for development)

**"Port 5000 is already in use"**
- Solution: Either close the process using port 5000, or change PORT in `.env`:
```
PORT=5001
```

### Frontend Issues

**"Cannot find module '@/components/...'"**
- Solution: Make sure you're in the `frontend` directory and ran `npm install`

**"API requests fail (Network Error)"**
- Check that backend is running on http://localhost:5000
- Verify `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

**"Blank page or errors after login"**
- Check browser console (F12) for error messages
- Make sure you completed the form correctly
- Try clearing localStorage and refreshing

### Common Issues

**"Email already registered"**
- Use a different email address or clear your database

**"Cannot find Vite"**
- Run `npm install` in the frontend directory

**"Backend error: Cast to ObjectId failed"**
- Ensure MongoDB connection is working
- Check that user IDs are valid

## Running Production Build

### Frontend Production Build
```bash
cd frontend
npm run build
npm run preview
```

### Backend for Production
1. Set `NODE_ENV=production` in `.env`
2. Update `CORS_ORIGINS` in production URLs
3. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name "alumni-backend"
```

## Database Reset (Development Only)

To clear all data and start fresh:

```bash
# In MongoDB Atlas:
1. Go to Collections
2. Drop the database or specific collections
3. Restart the server
```

Or via command line with MongoDB CLI:
```bash
mongo "mongodb+srv://username:password@cluster.mongodb.net/alumniconnect" --eval "db.dropDatabase()"
```

## Next Steps

1. **Customize branding**: Update colors in `frontend/tailwind.config.js`
2. **Add features**: Extend routes and models as needed
3. **Deploy**: See deployment guides for Vercel, Netlify, Render, etc.
4. **Add email notifications**: Integrate SendGrid or similar
5. **Add file uploads**: Integrate Cloudinary or AWS S3

## Support

For issues:
1. Check the console output for error messages
2. Verify environment variables are set correctly
3. Make sure all dependencies are installed (`npm install`)
4. Check the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint details
