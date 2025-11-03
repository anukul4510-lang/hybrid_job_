/**
 * Authentication Module
 * Handles user login, registration, and session management
 */

import { apiClient } from './api-client.js';
import { validatePhoneNumber, updatePhoneInputForCountry } from './phone-validation.js';

// DOM element references (will be initialized)
let loginSection, registerSection, homeSection, loginForm, registerForm;

/**
 * Initialize DOM elements
 */
function initializeElements() {
    loginSection = document.getElementById('login-section');
    registerSection = document.getElementById('register-section');
    homeSection = document.getElementById('home-section');
    loginForm = document.getElementById('login-form');
    registerForm = document.getElementById('register-form');
}

/**
 * Show login form
 */
function showLogin() {
    if (!loginSection || !registerSection || !homeSection) {
        initializeElements();
    }
    if (loginSection && registerSection && homeSection) {
        loginSection.classList.remove('hidden');
        registerSection.classList.add('hidden');
        homeSection.classList.add('hidden');
    }
}

/**
 * Show registration form
 */
function showRegister() {
    if (!loginSection || !registerSection || !homeSection) {
        initializeElements();
    }
    if (loginSection && registerSection && homeSection) {
        registerSection.classList.remove('hidden');
        loginSection.classList.add('hidden');
        homeSection.classList.add('hidden');
    }
}

/**
 * Show home/welcome section
 */
function showHome() {
    if (!loginSection || !registerSection || !homeSection) {
        initializeElements();
    }
    if (loginSection && registerSection && homeSection) {
        homeSection.classList.remove('hidden');
        loginSection.classList.add('hidden');
        registerSection.classList.add('hidden');
    }
}

// Make functions globally available immediately (before DOM loads)
if (typeof window !== 'undefined') {
    window.showLogin = showLogin;
    window.showRegister = showRegister;
    window.showHome = showHome;
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

// Update phone input when country code changes
function initializePhoneValidation() {
    const countryCodeSelect = document.getElementById('register-country-code');
    const phoneInput = document.getElementById('register-phone');
    const phoneHelpText = document.getElementById('phone-help-text');

    if (countryCodeSelect && phoneInput && phoneHelpText) {
        countryCodeSelect.addEventListener('change', function() {
            updatePhoneInputForCountry(phoneInput, countryCodeSelect, phoneHelpText);
            // Clear phone input when country changes
            phoneInput.value = '';
        });
    }
}

// Handle registration form submission
function initializeRegistrationForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
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

        // Validate phone number based on country code
        if (rawPhone) {
            const validation = validatePhoneNumber(rawPhone, countryCode);
            if (!validation.valid) {
                alert(validation.message);
                phoneInput.focus();
                return;
            }
        } else {
            alert('Please enter a phone number.');
            phoneInput.focus();
            return;
        }
        
        const phone = countryCode + rawPhone;
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

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Re-initialize elements
    initializeElements();
    
    // Initialize phone validation
    initializePhoneValidation();
    
    // Initialize registration form
    initializeRegistrationForm();
    
    // Initialize phone validation display
    const countrySelect = document.getElementById('register-country-code');
    const phoneInputField = document.getElementById('register-phone');
    const helpText = document.getElementById('phone-help-text');
    
    if (countrySelect && phoneInputField && helpText) {
        updatePhoneInputForCountry(phoneInputField, countrySelect, helpText);
    }
    
    // Check if user is already logged in
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

