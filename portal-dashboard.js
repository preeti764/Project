/* AlumniConnect — Dashboard Data Loading */

function esc(text) {
    const d = document.createElement('div');
    d.textContent = text || '';
    return d.innerHTML;
}

function emptyState(msg) {
    return `<p class="empty-state">${esc(msg)}</p>`;
}

async function loadStudentDashboard() {
    const user = PortalAPI.requireAuth('student');
    if (!user) return;

    const [stats, mentors, jobs, forum, myRequests] = await Promise.all([
        PortalAPI.getStats(),
        PortalAPI.getMentors(),
        PortalAPI.getJobs(),
        PortalAPI.getForum(),
        PortalAPI.getMentorship()
    ]);

    const avatar = PortalAPI.avatarUrl(user.firstName, user.lastName, 'student');
    const name = `${user.firstName} ${user.lastName}`;

    document.querySelector('.dashboard-header h1').textContent = `Welcome back, ${user.firstName}!`;
    const headerAvatar = document.querySelector('.user-avatar');
    if (headerAvatar) { headerAvatar.src = avatar; headerAvatar.alt = name; }

    const statCards = document.querySelectorAll('.stats-grid .stat-info h3');
    if (statCards[0]) statCards[0].textContent = stats.mentors;
    if (statCards[1]) statCards[1].textContent = stats.jobs;
    if (statCards[2]) statCards[2].textContent = stats.requests;
    if (statCards[3]) statCards[3].textContent = stats.forum;

    const profileEl = document.getElementById('profileSummary');
    if (profileEl) {
        profileEl.innerHTML = `
            <img src="${avatar}" alt="${esc(name)}">
            <div>
                <span class="role-badge">Student</span>
                <h3>${esc(name)}</h3>
                <p>${esc(user.department || 'Student')} · Class of ${esc(user.graduationYear || '—')}</p>
                <p><i class="fas fa-envelope"></i> ${esc(user.email)}</p>
            </div>`;
    }

    const requestedIds = new Set(myRequests.requests.map(r => r.alumni_id));

    function mentorItem(m, full) {
        const pending = requestedIds.has(m.id);
        return `
            <div class="list-item" data-mentor-id="${m.id}">
                <img src="${m.avatar}" alt="${esc(m.firstName)}">
                <div class="list-item-info">
                    <h4>${esc(m.firstName)} ${esc(m.lastName)}</h4>
                    <p>${esc(m.jobTitle)} at ${esc(m.company)}${full ? ` · ${esc(m.department)}` : ''}</p>
                </div>
                <button class="btn-sm btn-sm-primary btn-request-mentor" data-alumni-id="${m.id}" ${pending ? 'disabled style="opacity:0.6"' : ''}>
                    ${pending ? 'Requested' : (full ? 'Request Mentorship' : 'Request')}
                </button>
            </div>`;
    }

    const overviewMentors = document.getElementById('overviewMentors');
    const allMentors = document.getElementById('allMentors');
    if (overviewMentors) {
        overviewMentors.innerHTML = mentors.mentors.slice(0, 2).map(m => mentorItem(m, false)).join('') || emptyState('No mentors available yet.');
    }
    if (allMentors) {
        allMentors.innerHTML = mentors.mentors.map(m => mentorItem(m, true)).join('') || emptyState('No mentors available yet.');
    }

    function jobItem(j, showApply) {
        return `
            <div class="list-item" data-job-id="${j.id}">
                <div class="list-item-info">
                    <h4>${esc(j.title)}</h4>
                    <p>${esc(j.company)} · ${esc(j.location)} · Posted by ${esc(j.postedBy)}</p>
                    <span class="job-tag">${esc(j.jobType)}</span>
                </div>
                ${showApply ? `<button class="btn-sm btn-sm-primary btn-apply-job" data-job-id="${j.id}">Apply</button>` : ''}
            </div>`;
    }

    const overviewJobs = document.getElementById('overviewJobs');
    const allJobs = document.getElementById('allJobs');
    if (overviewJobs) {
        overviewJobs.innerHTML = jobs.jobs.slice(0, 2).map(j => jobItem(j, false)).join('') || emptyState('No jobs posted yet.');
    }
    if (allJobs) {
        allJobs.innerHTML = jobs.jobs.map(j => jobItem(j, true)).join('') || emptyState('No jobs posted yet.');
    }

    function forumItem(p) {
        return `
            <div class="forum-item">
                <h4>${esc(p.title)}</h4>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin: 8px 0;">${esc(p.content)}</p>
                <div class="forum-meta">
                    <span><i class="fas fa-user"></i> ${esc(p.author)}${p.authorRole === 'alumni' ? ' (Alumni)' : ''}</span>
                    <span><i class="fas fa-clock"></i> ${PortalAPI.timeAgo(p.createdAt)}</span>
                </div>
            </div>`;
    }

    const overviewForum = document.getElementById('overviewForum');
    const allForum = document.getElementById('allForum');
    if (overviewForum) {
        overviewForum.innerHTML = forum.posts.slice(0, 2).map(forumItem).join('') || emptyState('No discussions yet.');
    }
    if (allForum) {
        allForum.innerHTML = forum.posts.map(forumItem).join('') || emptyState('No discussions yet.');
    }

    bindStudentActions();
}

async function loadAlumniDashboard() {
    const user = PortalAPI.requireAuth('alumni');
    if (!user) return;

    const [stats, requests, myJobs, forum] = await Promise.all([
        PortalAPI.getStats(),
        PortalAPI.getMentorship(),
        PortalAPI.getMyJobs(),
        PortalAPI.getForum()
    ]);

    const avatar = PortalAPI.avatarUrl(user.firstName, user.lastName, 'alumni');
    const name = `${user.firstName} ${user.lastName}`;

    document.querySelector('.dashboard-header h1').textContent = `Welcome back, ${user.firstName}!`;
    const headerAvatar = document.querySelector('.user-avatar');
    if (headerAvatar) { headerAvatar.src = avatar; headerAvatar.alt = name; }

    const toggle = document.getElementById('mentorshipToggle');
    if (toggle) toggle.checked = user.mentorshipAvailable;

    const statCards = document.querySelectorAll('.stats-grid .stat-info h3');
    if (statCards[0]) statCards[0].textContent = stats.pending;
    if (statCards[1]) statCards[1].textContent = stats.jobs;
    if (statCards[2]) statCards[2].textContent = stats.accepted;
    if (statCards[3]) statCards[3].textContent = stats.forum;

    const profileEl = document.getElementById('profileSummary');
    if (profileEl) {
        profileEl.innerHTML = `
            <img src="${avatar}" alt="${esc(name)}">
            <div>
                <span class="role-badge">Alumni</span>
                <h3>${esc(name)}</h3>
                <p>${esc(user.jobTitle)} at ${esc(user.company)} · Class of ${esc(user.graduationYear || '—')}</p>
                <p><i class="fas fa-envelope"></i> ${esc(user.email)}</p>
            </div>`;
    }

    function requestItem(r, showActions) {
        const studentName = `${r.s_fn} ${r.s_ln}`;
        const avatarS = PortalAPI.avatarUrl(r.s_fn, r.s_ln, 'student');
        const statusClass = r.status === 'accepted' ? 'accepted' : 'pending';
        const actions = showActions && r.status === 'pending' ? `
            <div class="list-item-actions">
                <span class="status-badge ${statusClass}">${r.status}</span>
                <button class="btn-sm btn-sm-primary btn-accept-request" data-id="${r.id}" data-status="accepted">Accept</button>
                <button class="btn-sm btn-sm-outline btn-decline-request" data-id="${r.id}" data-status="declined">Decline</button>
            </div>` : `<span class="status-badge ${statusClass}">${r.status}</span>`;

        return `
            <div class="list-item" data-request-id="${r.id}">
                <img src="${avatarS}" alt="${esc(studentName)}">
                <div class="list-item-info">
                    <h4>${esc(studentName)}</h4>
                    <p>${esc(r.s_dept || 'Student')} · Class of ${esc(r.s_year || '—')}</p>
                    ${r.message ? `<p style="margin-top:4px;font-style:italic;">"${esc(r.message)}"</p>` : ''}
                </div>
                ${actions}
            </div>`;
    }

    const overviewRequests = document.getElementById('overviewRequests');
    const allRequests = document.getElementById('allRequests');
    const pending = requests.requests.filter(r => r.status === 'pending');
    if (overviewRequests) {
        overviewRequests.innerHTML = pending.slice(0, 2).map(r => requestItem(r, true)).join('') || emptyState('No pending requests.');
    }
    if (allRequests) {
        allRequests.innerHTML = requests.requests.map(r => requestItem(r, true)).join('') || emptyState('No mentorship requests yet.');
    }

    function myJobItem(j) {
        return `
            <div class="list-item">
                <div class="list-item-info">
                    <h4>${esc(j.title)}</h4>
                    <p>${esc(j.company)} · ${j.applicantCount} applicant${j.applicantCount !== 1 ? 's' : ''}</p>
                    <span class="job-tag">${esc(j.jobType)}</span>
                </div>
            </div>`;
    }

    const overviewMyJobs = document.getElementById('overviewMyJobs');
    if (overviewMyJobs) {
        overviewMyJobs.innerHTML = myJobs.jobs.slice(0, 2).map(myJobItem).join('') || emptyState('You have not posted any jobs yet.');
    }

    const allForum = document.getElementById('allForum');
    const overviewForum = document.getElementById('overviewForum');
    const forumItemFull = p => `
        <div class="forum-item">
            <h4>${esc(p.title)}</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin: 8px 0;">${esc(p.content)}</p>
            <div class="forum-meta">
                <span><i class="fas fa-user"></i> ${esc(p.author)}</span>
                <span><i class="fas fa-clock"></i> ${PortalAPI.timeAgo(p.createdAt)}</span>
            </div>
        </div>`;
    const forumItemShort = p => `
        <div class="forum-item">
            <h4>${esc(p.title)}</h4>
            <div class="forum-meta">
                <span><i class="fas fa-comment"></i> ${esc(p.author)}</span>
                <span><i class="fas fa-clock"></i> ${PortalAPI.timeAgo(p.createdAt)}</span>
            </div>
        </div>`;

    if (overviewForum) {
        overviewForum.innerHTML = forum.posts.slice(0, 2).map(forumItemShort).join('') || emptyState('No forum activity.');
    }
    if (allForum) {
        allForum.innerHTML = forum.posts.map(forumItemFull).join('') || emptyState('No discussions yet.');
    }

    bindAlumniActions(user);
}

window.loadStudentDashboard = loadStudentDashboard;
window.loadAlumniDashboard = loadAlumniDashboard;

function bindStudentActions() {
    document.querySelectorAll('.btn-request-mentor').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (btn.disabled) return;
            try {
                await PortalAPI.requestMentorship(Number(btn.dataset.alumniId), 'I would like mentorship guidance.');
                showToast('Mentorship request sent!');
                btn.textContent = 'Requested';
                btn.disabled = true;
                btn.style.opacity = '0.6';
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    });

    document.querySelectorAll('.btn-apply-job').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await PortalAPI.applyJob(btn.dataset.jobId);
                showToast('Application submitted!');
                btn.textContent = 'Applied';
                btn.disabled = true;
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    });
}

function bindAlumniActions(user) {
    const toggle = document.getElementById('mentorshipToggle');
    if (toggle) {
        toggle.addEventListener('change', async () => {
            try {
                const { user: updated } = await PortalAPI.updateProfile({ mentorshipAvailable: toggle.checked });
                PortalAPI.setSession(PortalAPI.getToken(), updated);
                showToast(toggle.checked ? 'You are now available for mentorship' : 'Mentorship availability turned off');
            } catch (err) {
                showToast(err.message, 'error');
                toggle.checked = !toggle.checked;
            }
        });
    }

    document.querySelectorAll('.btn-accept-request, .btn-decline-request').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await PortalAPI.updateMentorship(btn.dataset.id, btn.dataset.status);
                showToast(`Request ${btn.dataset.status}!`);
                loadAlumniDashboard();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.dashboard === 'student') {
        loadStudentDashboard().catch(() => {
            PortalAPI.clearSession();
            window.location.href = 'alumni-portal-login.html';
        });
    }
    if (document.body.dataset.dashboard === 'alumni') {
        loadAlumniDashboard().catch(() => {
            PortalAPI.clearSession();
            window.location.href = 'alumni-portal-login.html';
        });
    }
});
