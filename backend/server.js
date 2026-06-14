import dns from 'dns';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import authRoutes from './routes/auth.js';
import mentorRoutes from './routes/mentors.js';
import jobRoutes from './routes/jobs.js';
import mentorshipRoutes from './routes/mentorship.js';
import forumRoutes from './routes/forum.js';

dotenv.config();

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('FATAL: MONGO_URI environment variable is not set');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

// Passwords with special chars (e.g. dots) must be URL-encoded in MongoDB URIs
const mongoUri = (() => {
  const raw = process.env.MONGO_URI || '';
  const match = raw.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (!match) return raw;
  const [, protocol, user, pass, rest] = match;
  return `${protocol}${user}:${encodeURIComponent(decodeURIComponent(pass))}@${rest}`;
})();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/forum', forumRoutes);

// 404 handler
app.use('/api/*', (_req, res) => res.status(404).json({ message: 'Endpoint not found' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

mongoose
  .connect(mongoUri, { dbName: 'alumniconnect' })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
