# GitHub & Deployment Guide — AlumniConnect

Follow these steps in order. Each step takes about 5–10 minutes.

---

## Step 1 — Install required software

### A) Node.js (to run the project)
1. Go to [https://nodejs.org](https://nodejs.org)
2. Download **LTS** version
3. Install with default options
4. **Restart Cursor** (or your computer)

Verify in terminal:
```powershell
node -v
npm -v
```

### B) Git (to upload to GitHub)
1. Go to [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Install with default options
3. Restart terminal

Verify:
```powershell
git --version
```

---

## Step 2 — Run the project locally

**Option A — Double-click:** `start.bat` in the project folder

**Option B — Terminal:**
```powershell
cd c:\Users\Preeti\Downloads\PROJECT_INTERNSHIP
npm install
npm start
```

Open: **http://localhost:3000**

---

## Step 3 — Push to GitHub (website method, no CLI needed)

### Create repository on GitHub
1. Log in to [https://github.com](https://github.com)
2. Click **+** → **New repository**
3. Name: `alumniconnect-portal`
4. Set to **Public**
5. Do **not** add README (you already have one)
6. Click **Create repository**

### Upload files (GitHub web UI)
1. On the new repo page, click **uploading an existing file**
2. Drag all files from `PROJECT_INTERNSHIP` **except**:
   - `node_modules` folder (if it exists)
   - `data/alumniconnect.db` (database — recreated on server)
3. Commit message: `Initial commit — AlumniConnect portal`
4. Click **Commit changes**

---

## Step 4 — Push to GitHub (terminal method)

After Git is installed, run once:

```powershell
cd c:\Users\Preeti\Downloads\PROJECT_INTERNSHIP
git init
git add .
git commit -m "Initial commit — AlumniConnect full-stack portal"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/alumniconnect-portal.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 5 — Deploy online (free — Render.com)

Render runs your Node.js server so others can visit your project via a URL.

### Prepare
1. Code must be on GitHub (Step 3 or 4)
2. Sign up at [https://render.com](https://render.com) (free with GitHub login)

### Deploy
1. Dashboard → **New +** → **Web Service**
2. Connect your GitHub repo `alumniconnect-portal`
3. Settings:
   - **Name:** `alumniconnect`
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Plan:** Free
4. Click **Create Web Service**
5. Wait 2–5 minutes — you get a URL like `https://alumniconnect.onrender.com`

### Share in your report
```
Live demo: https://your-app.onrender.com
GitHub: https://github.com/YOUR_USERNAME/alumniconnect-portal
```

---

## Step 6 — Internship report checklist

- [ ] Screenshots: Landing, Login, Register, Student Dashboard, Alumni Dashboard
- [ ] Mention tech stack: HTML, CSS, JavaScript, Node.js, Express, SQLite, JWT
- [ ] Architecture: Frontend → REST API → SQLite database
- [ ] Demo accounts table (from README)
- [ ] GitHub repo link
- [ ] Live URL (if deployed)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm` not recognized | Install Node.js, restart terminal |
| `git` not recognized | Install Git, restart terminal |
| Login fails / "Cannot reach server" | Run `npm start` first, use `http://localhost:3000` |
| Render deploy fails | Check Build/Start commands match Step 5 |
| Port 3000 in use | Set `PORT=3001` then `npm start` |

---

## Quick reference — Demo accounts

| Email | Password | Role |
|-------|----------|------|
| student@demo.com | demo1234 | Student |
| michael@demo.com | demo1234 | Alumni |
