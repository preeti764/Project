const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'alumniconnect.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'alumni')),
            department TEXT DEFAULT '',
            graduation_year TEXT DEFAULT '',
            company TEXT DEFAULT '',
            job_title TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            mentorship_available INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alumni_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT NOT NULL,
            job_type TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (alumni_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS job_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(job_id, student_id),
            FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS mentorship_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            alumni_id INTEGER NOT NULL,
            message TEXT DEFAULT '',
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined')),
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (alumni_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS forum_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
}

function publicUser(row) {
    if (!row) return null;
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        role: row.role,
        department: row.department,
        graduationYear: row.graduation_year,
        company: row.company,
        jobTitle: row.job_title,
        bio: row.bio,
        mentorshipAvailable: !!row.mentorship_available,
        createdAt: row.created_at
    };
}

function seedIfEmpty() {
    const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
    if (count > 0) return;

    const hash = bcrypt.hashSync('demo1234', 10);
    const insertUser = db.prepare(`
        INSERT INTO users (first_name, last_name, email, password_hash, role, department, graduation_year, company, job_title, bio, mentorship_available)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const alumni = [
        ['Michael', 'Chen', 'michael@demo.com', 'Computer Science', '2018', 'Google', 'Software Engineer', 'Passionate about mentoring CS students into tech careers.', 1],
        ['Lisa', 'Wang', 'lisa@demo.com', 'Business', '2017', 'Microsoft', 'Product Manager', 'Happy to help with PM interviews and career transitions.', 1],
        ['David', 'Kumar', 'david@demo.com', 'Data Science', '2019', 'Amazon', 'Data Scientist', 'Mentoring students interested in data and ML roles.', 1],
        ['Emily', 'Rodriguez', 'emily@demo.com', 'Design', '2020', 'Apple', 'UX Designer', 'UX portfolio and design career guidance.', 1]
    ];

    const alumniIds = alumni.map(([fn, ln, email, dept, year, co, title, bio, avail]) =>
        insertUser.run(fn, ln, email, hash, 'alumni', dept, year, co, title, bio, avail).lastInsertRowid
    );

    insertUser.run('Alex', 'Student', 'student@demo.com', hash, 'student', 'Computer Science', '2026', '', '', 'Looking for SWE mentorship and internships.', 0);

    const insertJob = db.prepare(`
        INSERT INTO jobs (alumni_id, title, company, location, job_type, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertJob.run(alumniIds[0], 'Software Engineering Intern', 'Google', 'Mountain View, CA', 'internship', 'Summer internship for students strong in algorithms and system design.');
    insertJob.run(alumniIds[1], 'Product Management Intern', 'Microsoft', 'Redmond, WA', 'internship', 'PM intern role working on cloud products.');
    insertJob.run(alumniIds[2], 'Data Analyst', 'Amazon', 'Seattle, WA', 'full-time', 'Entry-level data analyst for recent graduates.');
    insertJob.run(alumniIds[3], 'UX Design Intern', 'Apple', 'Cupertino, CA', 'internship', 'Design intern collaborating on iOS experiences.');

    const studentId = db.prepare("SELECT id FROM users WHERE email = 'student@demo.com'").get().id;
    const insertForum = db.prepare('INSERT INTO forum_posts (user_id, title, content) VALUES (?, ?, ?)');
    insertForum.run(studentId, 'How to prepare for technical interviews?', 'Looking for advice on coding interviews and system design rounds.');
    insertForum.run(studentId, 'Best resources for learning cloud computing', 'Any recommendations for AWS/Azure certifications?');
    insertForum.run(alumniIds[0], 'Tips for landing your first internship', 'Sharing my experience from internship search — start early and network with alumni.');
}

initSchema();
seedIfEmpty();

module.exports = { db, publicUser };
