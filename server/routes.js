const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, publicUser } = require('./db');
const { authRequired, alumniOnly, studentOnly, JWT_SECRET } = require('./middleware');

const router = express.Router();

function signToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function getUserRow(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function avatarUrl(firstName, lastName, role) {
    const name = encodeURIComponent(`${firstName}+${lastName}`);
    const bg = role === 'alumni' ? '8b5cf6' : '6366f1';
    return `https://ui-avatars.com/api/?name=${name}&background=${bg}&color=fff`;
}

// ——— Auth ———
router.post('/auth/register', (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (!['student', 'alumni'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
        INSERT INTO users (first_name, last_name, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
    `).run(firstName.trim(), lastName.trim(), email.toLowerCase().trim(), hash, role);
    const user = publicUser(getUserRow(result.lastInsertRowid));
    const token = signToken(user);
    res.status(201).json({ token, user });
});

router.post('/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!row || !bcrypt.compareSync(password, row.password_hash)) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (role && row.role !== role) {
        return res.status(401).json({ error: `This account is registered as ${row.role}, not ${role}` });
    }
    const user = publicUser(row);
    res.json({ token: signToken(user), user });
});

router.get('/auth/me', authRequired, (req, res) => {
    const user = publicUser(getUserRow(req.user.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
});

router.put('/auth/profile', authRequired, (req, res) => {
    const { department, graduationYear, company, jobTitle, bio, mentorshipAvailable } = req.body;
    db.prepare(`
        UPDATE users SET
            department = COALESCE(?, department),
            graduation_year = COALESCE(?, graduation_year),
            company = COALESCE(?, company),
            job_title = COALESCE(?, job_title),
            bio = COALESCE(?, bio),
            mentorship_available = COALESCE(?, mentorship_available)
        WHERE id = ?
    `).run(
        department ?? null,
        graduationYear ?? null,
        company ?? null,
        jobTitle ?? null,
        bio ?? null,
        mentorshipAvailable !== undefined ? (mentorshipAvailable ? 1 : 0) : null,
        req.user.id
    );
    res.json({ user: publicUser(getUserRow(req.user.id)) });
});

// ——— Mentors ———
router.get('/mentors', authRequired, (req, res) => {
    const rows = db.prepare(`
        SELECT * FROM users
        WHERE role = 'alumni' AND mentorship_available = 1
        ORDER BY first_name
    `).all();
    res.json({
        mentors: rows.map(row => ({
            ...publicUser(row),
            avatar: avatarUrl(row.first_name, row.last_name, 'alumni')
        }))
    });
});

// ——— Mentorship ———
router.get('/mentorship', authRequired, (req, res) => {
    let rows;
    if (req.user.role === 'alumni') {
        rows = db.prepare(`
            SELECT mr.*, s.first_name AS s_fn, s.last_name AS s_ln, s.department AS s_dept, s.graduation_year AS s_year
            FROM mentorship_requests mr
            JOIN users s ON s.id = mr.student_id
            WHERE mr.alumni_id = ?
            ORDER BY mr.created_at DESC
        `).all(req.user.id);
    } else {
        rows = db.prepare(`
            SELECT mr.*, a.first_name AS a_fn, a.last_name AS a_ln
            FROM mentorship_requests mr
            JOIN users a ON a.id = mr.alumni_id
            WHERE mr.student_id = ?
            ORDER BY mr.created_at DESC
        `).all(req.user.id);
    }
    res.json({ requests: rows });
});

router.post('/mentorship', authRequired, studentOnly, (req, res) => {
    const { alumniId, message } = req.body;
    if (!alumniId) return res.status(400).json({ error: 'Alumni ID is required' });
    const alumni = getUserRow(alumniId);
    if (!alumni || alumni.role !== 'alumni') {
        return res.status(404).json({ error: 'Mentor not found' });
    }
    const existing = db.prepare(`
        SELECT id FROM mentorship_requests
        WHERE student_id = ? AND alumni_id = ? AND status = 'pending'
    `).get(req.user.id, alumniId);
    if (existing) {
        return res.status(409).json({ error: 'You already have a pending request with this mentor' });
    }
    const result = db.prepare(`
        INSERT INTO mentorship_requests (student_id, alumni_id, message)
        VALUES (?, ?, ?)
    `).run(req.user.id, alumniId, message || '');
    res.status(201).json({ id: result.lastInsertRowid, message: 'Mentorship request sent' });
});

router.patch('/mentorship/:id', authRequired, alumniOnly, (req, res) => {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ error: 'Status must be accepted or declined' });
    }
    const row = db.prepare('SELECT * FROM mentorship_requests WHERE id = ? AND alumni_id = ?').get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ error: 'Request not found' });
    db.prepare('UPDATE mentorship_requests SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: `Request ${status}` });
});

// ——— Jobs ———
router.get('/jobs', authRequired, (req, res) => {
    const rows = db.prepare(`
        SELECT j.*, u.first_name, u.last_name, u.company AS alumni_company
        FROM jobs j
        JOIN users u ON u.id = j.alumni_id
        ORDER BY j.created_at DESC
    `).all();
    res.json({
        jobs: rows.map(j => ({
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            jobType: j.job_type,
            description: j.description,
            createdAt: j.created_at,
            postedBy: `${j.first_name} ${j.last_name}`,
            alumniId: j.alumni_id
        }))
    });
});

router.get('/jobs/mine', authRequired, alumniOnly, (req, res) => {
    const rows = db.prepare('SELECT * FROM jobs WHERE alumni_id = ? ORDER BY created_at DESC').all(req.user.id);
    const withApplicants = rows.map(j => {
        const count = db.prepare('SELECT COUNT(*) AS c FROM job_applications WHERE job_id = ?').get(j.id).c;
        return {
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            jobType: j.job_type,
            description: j.description,
            applicantCount: count,
            createdAt: j.created_at
        };
    });
    res.json({ jobs: withApplicants });
});

router.post('/jobs', authRequired, alumniOnly, (req, res) => {
    const { title, company, location, jobType, description } = req.body;
    if (!title || !company || !location || !jobType || !description) {
        return res.status(400).json({ error: 'All job fields are required' });
    }
    const result = db.prepare(`
        INSERT INTO jobs (alumni_id, title, company, location, job_type, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, title, company, location, jobType, description);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Job posted successfully' });
});

router.post('/jobs/:id/apply', authRequired, studentOnly, (req, res) => {
    const job = db.prepare('SELECT id FROM jobs WHERE id = ?').get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    try {
        db.prepare('INSERT INTO job_applications (job_id, student_id) VALUES (?, ?)').run(req.params.id, req.user.id);
        res.status(201).json({ message: 'Application submitted' });
    } catch {
        res.status(409).json({ error: 'You already applied to this job' });
    }
});

// ——— Forum ———
router.get('/forum', authRequired, (req, res) => {
    const rows = db.prepare(`
        SELECT fp.*, u.first_name, u.last_name, u.role
        FROM forum_posts fp
        JOIN users u ON u.id = fp.user_id
        ORDER BY fp.created_at DESC
    `).all();
    res.json({
        posts: rows.map(p => ({
            id: p.id,
            title: p.title,
            content: p.content,
            createdAt: p.created_at,
            author: `${p.first_name} ${p.last_name}`,
            authorRole: p.role
        }))
    });
});

router.post('/forum', authRequired, (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    const result = db.prepare('INSERT INTO forum_posts (user_id, title, content) VALUES (?, ?, ?)').run(req.user.id, title.trim(), content.trim());
    res.status(201).json({ id: result.lastInsertRowid, message: 'Post created' });
});

// ——— Stats ———
router.get('/stats', authRequired, (req, res) => {
    if (req.user.role === 'student') {
        const mentors = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'alumni' AND mentorship_available = 1").get().c;
        const jobs = db.prepare('SELECT COUNT(*) AS c FROM jobs').get().c;
        const requests = db.prepare("SELECT COUNT(*) AS c FROM mentorship_requests WHERE student_id = ? AND status = 'pending'").get(req.user.id).c;
        const forum = db.prepare('SELECT COUNT(*) AS c FROM forum_posts').get().c;
        res.json({ mentors, jobs, requests, forum });
    } else {
        const pending = db.prepare("SELECT COUNT(*) AS c FROM mentorship_requests WHERE alumni_id = ? AND status = 'pending'").get(req.user.id).c;
        const jobs = db.prepare('SELECT COUNT(*) AS c FROM jobs WHERE alumni_id = ?').get(req.user.id).c;
        const accepted = db.prepare("SELECT COUNT(*) AS c FROM mentorship_requests WHERE alumni_id = ? AND status = 'accepted'").get(req.user.id).c;
        const forum = db.prepare('SELECT COUNT(*) AS c FROM forum_posts').get().c;
        res.json({ pending, jobs, accepted, forum });
    }
});

module.exports = router;
