import express from 'express';
import ForumPost from '../models/ForumPost.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('author', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      posts: posts.map((p) => ({
        id: p._id,
        title: p.title,
        content: p.content,
        createdAt: p.createdAt,
        author: p.author ? { id: p.author._id, name: p.author.name, role: p.author.role } : null,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Validation
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    if (title.trim().length < 3) {
      return res.status(400).json({ message: 'Title must be at least 3 characters' });
    }
    if (content.trim().length < 10) {
      return res.status(400).json({ message: 'Content must be at least 10 characters' });
    }

    const post = await ForumPost.create({
      author: req.user.id,
      title: title.trim(),
      content: content.trim(),
    });

    res.status(201).json({
      post: { id: post._id, title: post.title, content: post.content },
      message: 'Post created successfully',
    });
  } catch (err) {
    console.error('Create forum post error:', err);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name email role');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({
      post: {
        id: post._id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author ? { id: post.author._id, name: post.author.name, email: post.author.email, role: post.author.role } : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await ForumPost.findOne({ _id: req.params.id, author: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found or unauthorized' });

    post.title = title.trim();
    post.content = content.trim();
    await post.save();

    res.json({ message: 'Post updated successfully', post: { id: post._id, title: post.title } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await ForumPost.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found or unauthorized' });
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
