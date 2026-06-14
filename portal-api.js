/* AlumniConnect — API Client */

const API_BASE = (window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null')
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;

function getToken() {
    return localStorage.getItem('alumni_token');
}

function setSession(token, user) {
    localStorage.setItem('alumni_token', token);
    localStorage.setItem('alumni_user', JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem('alumni_token');
    localStorage.removeItem('alumni_user');
}

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('alumni_user'));
    } catch {
        return null;
    }
}

async function apiRequest(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || 'Request failed');
    }
    return data;
}

const PortalAPI = {
    register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => apiRequest('/auth/me'),
    updateProfile: (body) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
    getStats: () => apiRequest('/stats'),
    getMentors: () => apiRequest('/mentors'),
    getMentorship: () => apiRequest('/mentorship'),
    requestMentorship: (alumniId, message) => apiRequest('/mentorship', { method: 'POST', body: JSON.stringify({ alumniId, message }) }),
    updateMentorship: (id, status) => apiRequest(`/mentorship/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getJobs: () => apiRequest('/jobs'),
    getMyJobs: () => apiRequest('/jobs/mine'),
    postJob: (body) => apiRequest('/jobs', { method: 'POST', body: JSON.stringify(body) }),
    applyJob: (id) => apiRequest(`/jobs/${id}/apply`, { method: 'POST' }),
    getForum: () => apiRequest('/forum'),
    postForum: (title, content) => apiRequest('/forum', { method: 'POST', body: JSON.stringify({ title, content }) }),
    getToken,
    setSession,
    clearSession,
    getStoredUser,
    avatarUrl(firstName, lastName, role) {
        const name = encodeURIComponent(`${firstName}+${lastName}`);
        const bg = role === 'alumni' ? '8b5cf6' : '6366f1';
        return `https://ui-avatars.com/api/?name=${name}&background=${bg}&color=fff`;
    },
    redirectToDashboard(role) {
        window.location.href = role === 'alumni'
            ? 'alumni-portal-alumni-dashboard.html'
            : 'alumni-portal-student-dashboard.html';
    },
    requireAuth(expectedRole) {
        const user = getStoredUser();
        if (!user || !getToken()) {
            window.location.href = 'alumni-portal-login.html';
            return null;
        }
        if (expectedRole && user.role !== expectedRole) {
            PortalAPI.redirectToDashboard(user.role);
            return null;
        }
        return user;
    },
    logout() {
        clearSession();
        window.location.href = 'alumni-portal-landing.html';
    },
    timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${Math.max(1, mins)} min ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
        const days = Math.floor(hrs / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
};

window.PortalAPI = PortalAPI;
