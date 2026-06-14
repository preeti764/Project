import express from 'express';
import Job from '../models/Job.js';
import { authMiddleware, alumniOnly, studentOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'name company designation')
      .sort({ createdAt: -1 });

    res.json({
      jobs: jobs.map((j) => ({
        id: j._id,
        title: j.title,
        company: j.company,
        jobType: j.jobType,
        description: j.description,
        createdAt: j.createdAt,
        postedBy: j.postedBy
          ? { id: j.postedBy._id, name: j.postedBy.name, company: j.postedBy.company }
          : null,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine', authMiddleware, alumniOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    res.json({
      jobs: jobs.map((j) => ({
        id: j._id,
        title: j.title,
        company: j.company,
        jobType: j.jobType,
        description: j.description,
        createdAt: j.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, alumniOnly, async (req, res) => {
  try {
    const { title, company, jobType, description } = req.body;
    
    // Validation
    if (!title?.trim() || !company?.trim() || !jobType || !description?.trim()) {
      return res.status(400).json({ message: 'All job fields are required' });
    }
    if (!['internship', 'full-time', 'part-time'].includes(jobType)) {
      return res.status(400).json({ message: 'Invalid job type' });
    }
    if (title.trim().length < 3) {
      return res.status(400).json({ message: 'Job title must be at least 3 characters' });
    }
    if (description.trim().length < 10) {
      return res.status(400).json({ message: 'Job description must be at least 10 characters' });
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      jobType,
      description: description.trim(),
      postedBy: req.user.id,
    });

    res.status(201).json({
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
        jobType: job.jobType,
        description: job.description,
      },
      message: 'Job posted successfully',
    });
  } catch (err) {
    console.error('Post job error:', err);
    res.status(500).json({ message: 'Failed to post job' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name company designation email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
        jobType: job.jobType,
        description: job.description,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        postedBy: job.postedBy
          ? { id: job.postedBy._id, name: job.postedBy.name, company: job.postedBy.company, designation: job.postedBy.designation, email: job.postedBy.email }
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, alumniOnly, async (req, res) => {
  try {
    const { title, company, jobType, description } = req.body;
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user.id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });

    if (!['internship', 'full-time', 'part-time'].includes(jobType)) {
      return res.status(400).json({ message: 'Invalid job type' });
    }

    job.title = title?.trim() || job.title;
    job.company = company?.trim() || job.company;
    job.jobType = jobType || job.jobType;
    job.description = description?.trim() || job.description;
    await job.save();

    res.json({ message: 'Job updated successfully', job: { id: job._id, title: job.title, company: job.company } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, alumniOnly, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user.id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/apply', authMiddleware, studentOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
