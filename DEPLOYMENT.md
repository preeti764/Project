# Deployment Guide - Alumni Portal

## Overview
This guide covers deploying the Alumni Portal to production on various platforms.

## Backend Deployment

### Option 1: Deploy on Render

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Sign up/Login on [Render](https://render.com)**

3. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Select backend folder: `/backend`
   - Name: `alumni-backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Set Environment Variables**
   - Go to "Environment"
   - Add:
     ```
     MONGO_URI=<your-mongodb-uri>
     JWT_SECRET=<strong-random-secret>
     NODE_ENV=production
     PORT=5000
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the service URL (e.g., `https://alumni-backend.onrender.com`)

### Option 2: Deploy on Railway

1. **Sign up on [Railway](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "GitHub Repo"
   - Choose your repository

3. **Configure Backend**
   - Add `MONGO_URI` and `JWT_SECRET` variables
   - Set `NODE_ENV=production`
   - Point to backend folder

4. **Deploy**
   - Railway auto-deploys on push
   - Copy the backend URL from Railway dashboard

### Option 3: Deploy on Heroku (Deprecated - use Render/Railway)

Alternative to above services.

## Frontend Deployment

### Option 1: Deploy on Vercel

1. **Sign up on [Vercel](https://vercel.com)**

2. **Import Project**
   - Click "New Project"
   - Import GitHub repository
   - Select `/frontend` as root directory

3. **Environment Variables**
   - Add: `VITE_API_URL=<your-backend-url>/api`
   - Example: `https://alumni-backend.onrender.com/api`

4. **Deploy**
   - Click "Deploy"
   - Your frontend is now live!

### Option 2: Deploy on Netlify

1. **Sign up on [Netlify](https://netlify.com)**

2. **Connect Repository**
   - Click "Add new site" → "Import an existing project"
   - Select GitHub and your repository

3. **Configure Build**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **Environment Variables**
   - Add: `VITE_API_URL=<your-backend-url>/api`

5. **Deploy**
   - Click "Deploy site"

### Option 3: Deploy on AWS S3 + CloudFront

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3:**
   - Create S3 bucket
   - Upload contents of `dist` folder
   - Enable "Static website hosting"

3. **Setup CloudFront:**
   - Create distribution pointing to S3 bucket
   - Set CNAME to your domain

## Database Deployment

Your MongoDB Atlas cluster is already cloud-hosted. Just ensure:

1. **IP Whitelisting**
   - Go to MongoDB Atlas → Security → Network Access
   - Add your deployment service IP or use 0.0.0.0/0 (less secure)

2. **Connection String**
   - Your `MONGO_URI` environment variable
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

## Custom Domain Setup

### Frontend Custom Domain (Vercel)
1. Go to project settings → Domains
2. Add custom domain
3. Update DNS records as instructed

### Backend Custom Domain (Render/Railway)
1. Follow platform's domain setup instructions
2. Use custom domain in frontend's `VITE_API_URL`

## Environment Variables Checklist

**Backend (.env)**
- ✅ `MONGO_URI` - MongoDB connection string
- ✅ `JWT_SECRET` - Strong random secret (32+ chars)
- ✅ `NODE_ENV=production`
- ✅ `PORT` (optional, platform may set this)

**Frontend (.env.production)**
- ✅ `VITE_API_URL` - Production backend URL (e.g., `https://alumni-backend.onrender.com/api`)

## Post-Deployment Testing

1. **Test Backend Health**
   ```bash
   curl https://your-backend-url/api/health
   # Should return: {"status":"ok"}
   ```

2. **Test Frontend**
   - Visit your frontend URL
   - Test registration/login
   - Verify API calls work (check Network tab)

3. **Test Database Connection**
   - Create a test account
   - Verify it's stored in MongoDB
   - Try logging in

## Performance Optimization

### Frontend
- Already optimized with Vite
- Enable gzip compression in deployment
- Use CDN for static assets

### Backend
- Add caching headers for static responses
- Consider adding Redis for session caching
- Monitor MongoDB query performance

### Database
- Create indexes for frequently queried fields
- Monitor connection pool usage
- Archive old records periodically

## Security Hardening

1. **Enable HTTPS** (all platforms do this automatically)

2. **Set Secure Headers**
   ```javascript
   // In server.js, add:
   app.use((req, res, next) => {
     res.setHeader('X-Content-Type-Options', 'nosniff');
     res.setHeader('X-Frame-Options', 'DENY');
     res.setHeader('X-XSS-Protection', '1; mode=block');
     next();
   });
   ```

3. **Rate Limiting** (recommended)
   ```bash
   npm install express-rate-limit
   ```

4. **CORS Configuration**
   - Update frontend URL in backend CORS settings
   - Don't allow all origins in production

5. **JWT Secret**
   - Use strong, random secret (minimum 32 characters)
   - Rotate periodically in production
   - Never commit to version control

## Monitoring & Debugging

### Logs
- **Render**: View logs in dashboard
- **Railway**: Real-time logs visible
- **Vercel**: Access logs in deployment details

### Errors
- Check platform dashboards for error rates
- Monitor MongoDB connection errors
- Set up error tracking (Sentry recommended)

### Performance
- Use Chrome DevTools Network tab
- Monitor API response times
- Check database query performance

## Continuous Deployment

Setup automatic deployment on push:

1. Connect your GitHub repository
2. Each push to main branch triggers deployment
3. Automatic testing and building
4. Deploy to production if tests pass

## Scaling Considerations

As your user base grows:

1. **Database**
   - Upgrade MongoDB tier
   - Add read replicas
   - Consider sharding

2. **Backend**
   - Add more server instances
   - Implement load balancing
   - Consider serverless functions

3. **Frontend**
   - Enable CDN
   - Implement code splitting
   - Add service workers

## Troubleshooting Deployment Issues

### "Cannot connect to MongoDB"
- Verify IP whitelist in MongoDB Atlas
- Check connection string format
- Ensure credentials are URL-encoded

### "CORS errors in production"
- Update backend CORS settings with frontend URL
- Check frontend's `VITE_API_URL`

### "Blank page on production frontend"
- Check browser console for errors
- Verify API URL is correct
- Check if backend is accessible

### "API endpoints return 404"
- Ensure backend is deployed correctly
- Check route paths match exactly
- Verify JWT tokens aren't expired

## Rollback Plan

If something goes wrong:

1. **Render/Railway**: Click "Deploy Previous"
2. **Vercel**: Go to Deployments, select previous build
3. **Netlify**: Go to Deploys, select previous

## Support & Monitoring

1. Set up error logging (Sentry)
2. Monitor API performance (DataDog)
3. Set up alerts for failures
4. Regular backup of MongoDB data

## Additional Resources

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Express Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)
