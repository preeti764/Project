import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const mentors = await User.find({
      role: 'alumni',
      availableForMentorship: true,
    }).select('-password');

    res.json({
      mentors: mentors.map((m) => ({
        id: m._id,
        name: m.name,
        email: m.email,
        company: m.company,
        designation: m.designation,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
