/**
 * Authentication Module
 * Handles user login, registration, and session management
 */

import { apiClient } from './api-client.js';

// Get DOM elements
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const homeSection = document.getElementById('home-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

/**
 * Show login form
 */
function showLogin() {
    loginSection.classList.remove('hidden');
    registerSection.classList.add('hidden');
    homeSection.classList.add('hidden');
}

/**
 * Show registration form
 */
function showRegister() {
    registerSection.classList.remove('hidden');
    loginSection.classList.add('hidden');
    homeSection.classList.add('hidden');
}

/**
 * Show home/welcome section
 */
function showHome() {
    homeSection.classList.remove('hidden');
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
}

// Toggle company name field based on role selection
const registerRoleSelect = document.getElementById('register-role');
const companyNameGroup = document.getElementById('company-name-group');
const companyNameInput = document.getElementById('register-company-name');

if (registerRoleSelect && companyNameGroup && companyNameInput) {
    registerRoleSelect.addEventListener('change', function() {
        if (this.value === 'recruiter') {
            companyNameGroup.style.display = 'block';
            companyNameInput.setAttribute('required', 'required');
        } else {
            companyNameGroup.style.display = 'none';
            companyNameInput.removeAttribute('required');
            companyNameInput.value = '';
        }
    });
}

// Make functions globally available
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showHome = showHome;

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await apiClient.login({ email, password });
            apiClient.setToken(response.access_token);
            
            // Store user info
            localStorage.setItem('user_email', email);
            
            // Redirect based on role
            const userData = await apiClient.getCurrentUser();
            localStorage.setItem('user_role', userData.role);
            
            // Redirect to appropriate dashboard
            if (userData.role === 'jobseeker') {
                window.location.href = 'jobseeker-dashboard.html';
            } else if (userData.role === 'recruiter') {
                window.location.href = 'recruiter-dashboard.html';
            } else if (userData.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            }
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });
}

// Handle registration form submission
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;
        const first_name = document.getElementById('register-first-name')?.value;
        const last_name = document.getElementById('register-last-name')?.value;
        const phoneInput = document.getElementById('register-phone');
        const countryCodeSelect = document.getElementById('register-country-code');
        const rawPhone = phoneInput?.value.trim();
        const countryCode = countryCodeSelect?.value;

        if (rawPhone && !/^\d{7,15}$/.test(rawPhone)) {
            alert('Please enter a valid phone number (digits only, 7 to 15 digits).');
            return;
        }
        const phone = rawPhone ? countryCode + rawPhone : null;
        const location = document.getElementById('register-location')?.value;
        const company_name = document.getElementById('register-company-name')?.value.trim();

        // Validate company name for recruiters
        if (role === 'recruiter' && (!company_name || company_name.length < 2)) {
            alert('Please enter a valid company name (at least 2 characters).');
            return;
        }

        try {
            await apiClient.register({ 
                email, password, role,
                first_name, last_name, phone, location,
                company_name: role === 'recruiter' ? company_name : null
            });
            alert('Registration successful! Please login.');
            showLogin();
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    });
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = apiClient.getToken();
    if (token) {
        // User is logged in, check their role and redirect
        const role = localStorage.getItem('user_role');
        if (role) {
            if (role === 'jobseeker' && !window.location.pathname.includes('jobseeker-dashboard')) {
                window.location.href = 'jobseeker-dashboard.html';
            } else if (role === 'recruiter' && !window.location.pathname.includes('recruiter-dashboard')) {
                window.location.href = 'recruiter-dashboard.html';
            } else if (role === 'admin' && !window.location.pathname.includes('admin-dashboard')) {
                window.location.href = 'admin-dashboard.html';
            }
        }
    } else {
        showHome();
    }
});

