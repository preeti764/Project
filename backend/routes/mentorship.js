import express from 'express';
import MentorshipRequest from '../models/MentorshipRequest.js';
import User from '../models/User.js';
import { authMiddleware, alumniOnly, studentOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/request', authMiddleware, studentOnly, async (req, res) => {
  try {
    const { alumniId, message } = req.body;
    
    if (!alumniId) return res.status(400).json({ message: 'Alumni ID is required' });

    const alumni = await User.findOne({ _id: alumniId, role: 'alumni' });
    if (!alumni) return res.status(404).json({ message: 'Mentor not found' });
    
    if (!alumni.availableForMentorship) {
      return res.status(400).json({ message: 'This mentor is not available for mentorship' });
    }

    const existing = await MentorshipRequest.findOne({
      student: req.user.id,
      alumni: alumniId,
      status: 'pending',
    });
    if (existing) {
      return res.status(409).json({ message: 'You already have a pending request with this mentor' });
    }

    const request = await MentorshipRequest.create({
      student: req.user.id,
      alumni: alumniId,
      message: message?.trim() || 'I would like mentorship guidance.',
    });

    res.status(201).json({ id: request._id, message: 'Mentorship request sent' });
  } catch (err) {
    console.error('Request mentorship error:', err);
    res.status(500).json({ message: 'Failed to send request' });
  }
});

router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.role === 'alumni' ? { alumni: req.user.id } : { student: req.user.id };

    const requests = await MentorshipRequest.find(filter)
      .populate('student', 'name email')
      .populate('alumni', 'name company designation')
      .sort({ createdAt: -1 });

    res.json({
      requests: requests.map((r) => ({
        id: r._id,
        status: r.status,
        message: r.message,
        createdAt: r.createdAt,
        student: r.student ? { id: r.student._id, name: r.student.name, email: r.student.email } : null,
        alumni: r.alumni
          ? { id: r.alumni._id, name: r.alumni.name, company: r.alumni.company, designation: r.alumni.designation }
          : null,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/requests/:id', authMiddleware, alumniOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or declined' });
    }

    const request = await MentorshipRequest.findOne({ _id: req.params.id, alumni: req.user.id });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();
    res.json({ message: `Request ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
