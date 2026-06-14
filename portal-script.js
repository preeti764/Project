/* AlumniConnect — Shared JavaScript */

// Navigation and Page Navigation
function showLogin() {
    window.location.href = 'alumni-portal-login.html';
}

function showRegister() {
    window.location.href = 'alumni-portal-register.html';
}

// Toast Notifications with Better Styling
function showToast(message, type = 'success') {
    const existing = document.querySelector('.form-success-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'form-success-toast';
    toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 2700);
}

// Navbar Scroll Shadow Effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
}

// Enhanced Mobile Menu with Smooth Animations
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('mobile-open');
        menuBtn.setAttribute('aria-expanded', isOpen);
        const icon = menuBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
        }
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('mobile-open');
            const icon = menuBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-container') && navLinks.classList.contains('mobile-open')) {
            navLinks.classList.remove('mobile-open');
            const icon = menuBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        }
    });
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
}

// Enhanced Form Field Error Display
function showFieldError(input, message) {
    const group = input.closest('.form-group') || input.closest('.role-selection');
    if (!group) return;

    let errorEl = group.querySelector('.form-error');
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'form-error';
        group.appendChild(errorEl);
    }
    errorEl.textContent = message;
    errorEl.classList.add('visible');
    group.classList.add('error');
    
    // Highlight input with error animation
    if (input.tagName !== 'LABEL' && input.focus) {
        input.focus();
    }
}

// Clear All Field Errors
function clearFieldErrors(form) {
    form.querySelectorAll('.form-error').forEach(el => {
        el.classList.remove('visible');
        el.textContent = '';
    });
    form.querySelectorAll('.form-group.error, .role-selection.error').forEach(el => {
        el.classList.remove('error');
    });
}

// Email Validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password Validation
function validatePassword(password) {
    return password.length >= 6;
}

// Enhanced Role Button Interaction
function initRoleButtons() {
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            roleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Login Form Validation
function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    initRoleButtons();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearFieldErrors(form);

        const emailInput = form.querySelector('input[name="email"]');
        const passwordInput = form.querySelector('input[name="password"]');
        let valid = true;

        if (!emailInput.value.trim()) {
            showFieldError(emailInput, 'Email is required');
            valid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
            showFieldError(emailInput, 'Please enter a valid email address');
            valid = false;
        }

        if (!passwordInput.value) {
            showFieldError(passwordInput, 'Password is required');
            valid = false;
        } else if (!validatePassword(passwordInput.value)) {
            showFieldError(passwordInput, 'Password must be at least 6 characters');
            valid = false;
        }

        if (!valid) return;

        const activeRole = document.querySelector('.role-btn.active');
        const role = activeRole ? activeRole.dataset.role : 'student';
        const submitBtn = form.querySelector('.btn-auth');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Signing in...'; }

        PortalAPI.login({
            email: emailInput.value.trim(),
            password: passwordInput.value,
            role
        }).then(({ token, user }) => {
            PortalAPI.setSession(token, user);
            showToast('Login successful! Redirecting...');
            setTimeout(() => PortalAPI.redirectToDashboard(user.role), 600);
        }).catch(err => {
            const msg = err.message === 'Failed to fetch'
                ? 'Cannot reach server. Run: npm start in project folder, then open http://localhost:3000'
                : err.message;
            showToast(msg, 'error');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
        });
    });
}

// Register Form Validation
function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    initRoleButtons();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearFieldErrors(form);

        const firstName = form.querySelector('input[name="firstName"]');
        const lastName = form.querySelector('input[name="lastName"]');
        const emailInput = form.querySelector('input[name="email"]');
        const password = form.querySelector('input[name="password"]');
        const confirmPassword = form.querySelector('input[name="confirmPassword"]');
        const termsCheckbox = form.querySelector('input[type="checkbox"]');
        let valid = true;

        if (!firstName.value.trim()) {
            showFieldError(firstName, 'First name is required');
            valid = false;
        }

        if (!lastName.value.trim()) {
            showFieldError(lastName, 'Last name is required');
            valid = false;
        }

        if (!emailInput.value.trim()) {
            showFieldError(emailInput, 'Email is required');
            valid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
            showFieldError(emailInput, 'Please enter a valid email address');
            valid = false;
        }

        if (!password.value) {
            showFieldError(password, 'Password is required');
            valid = false;
        } else if (!validatePassword(password.value)) {
            showFieldError(password, 'Password must be at least 6 characters');
            valid = false;
        }

        if (password.value !== confirmPassword.value) {
            showFieldError(confirmPassword, 'Passwords do not match');
            valid = false;
        }

        if (!termsCheckbox.checked) {
            showToast('Please agree to the Terms of Service', 'error');
            valid = false;
        }

        if (!valid) return;

        const role = document.querySelector('.role-btn.active').dataset.role;
        const submitBtn = form.querySelector('.btn-auth');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating account...'; }

        PortalAPI.register({
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: emailInput.value.trim(),
            password: password.value,
            role
        }).then(({ token, user }) => {
            PortalAPI.setSession(token, user);
            showToast('Account created! Redirecting...');
            setTimeout(() => PortalAPI.redirectToDashboard(user.role), 600);
        }).catch(err => {
            const msg = err.message === 'Failed to fetch'
                ? 'Cannot reach server. Run: npm start in project folder, then open http://localhost:3000'
                : err.message;
            showToast(msg, 'error');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
        });
    });
}

// Dashboard Initialization
function initDashboard() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const toggleBtn = document.querySelector('.mobile-sidebar-toggle');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    const navLinks = document.querySelectorAll('.sidebar-nav a[data-section]');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            const target = document.getElementById(sectionId);
            if (target) target.classList.add('active');

            if (sidebar) sidebar.classList.remove('open');
        });
    });

    // Logout Button
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => PortalAPI.logout());
    }

    // Mentor Search
    const mentorSearch = document.getElementById('mentorSearch');
    if (mentorSearch) {
        mentorSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.mentor-list .list-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }

    // Job Search
    const jobSearch = document.getElementById('jobSearch');
    if (jobSearch) {
        jobSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.job-list .list-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }

    // Post Job Form
    const postJobForm = document.getElementById('postJobForm');
    if (postJobForm) {
        postJobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = postJobForm.querySelector('[name="title"]')?.value.trim();
            const company = postJobForm.querySelector('[name="company"]')?.value.trim();
            const location = postJobForm.querySelector('[name="location"]')?.value.trim();
            const jobType = postJobForm.querySelector('[name="jobType"]')?.value;
            const description = postJobForm.querySelector('[name="description"]')?.value.trim();
            try {
                await PortalAPI.postJob({ title, company, location, jobType, description });
                showToast('Job posted successfully!');
                postJobForm.reset();
                if (typeof loadAlumniDashboard === 'function') loadAlumniDashboard();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    // Forum Form
    const forumForm = document.getElementById('forumForm');
    if (forumForm) {
        forumForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = forumForm.querySelector('textarea');
            const content = input?.value.trim();
            if (!content) return;
            const title = content.length > 60 ? content.slice(0, 57) + '...' : content;
            try {
                await PortalAPI.postForum(title, content);
                showToast('Posted to the forum!');
                input.value = '';
                if (typeof loadStudentDashboard === 'function') loadStudentDashboard();
                if (typeof loadAlumniDashboard === 'function') loadAlumniDashboard();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }
}

// Scroll Reveal for Landing Sections
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
}

function initPageLoad() {
    document.body.classList.add('page-loaded');
}

// Initialize Everything on Page Load
document.addEventListener('DOMContentLoaded', () => {
    initPageLoad();
    initMobileMenu();
    initNavbarScroll();
    initSmoothScroll();
    initScrollReveal();
    initLoginForm();
    initRegisterForm();
    initDashboard();
});
