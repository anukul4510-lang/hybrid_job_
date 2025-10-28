/**
 * Utility Functions
 * Helper functions for DOM manipulation and common operations
 */

/**
 * Display error message
 * @param {string} message - Error message to display
 * @param {HTMLElement} container - Container element to show message in
 */
function showError(message, container) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    if (container) {
        container.insertBefore(errorDiv, container.firstChild);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

/**
 * Display success message
 * @param {string} message - Success message to display
 * @param {HTMLElement} container - Container element to show message in
 */
function showSuccess(message, container) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    if (container) {
        container.insertBefore(successDiv, container.firstChild);
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
}

/**
 * Format date string for display
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format currency for display
 * @param {number} amount - Amount
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Create a loading spinner
 * @returns {HTMLElement} Loading spinner element
 */
function createLoader() {
    const loader = document.createElement('div');
    loader.className = 'loading';
    loader.innerHTML = '<p>Loading...</p>';
    return loader;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

/**
 * Get current user role
 * @returns {string} User role
 */
function getCurrentUserRole() {
    return localStorage.getItem('user_role');
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    window.location.href = 'index.html';
}

/**
 * Parse HTML string to DOM element
 * @param {string} htmlString - HTML string
 * @returns {HTMLElement} DOM element
 */
function createElement(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions
window.showError = showError;
window.showSuccess = showSuccess;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.createLoader = createLoader;
window.isAuthenticated = isAuthenticated;
window.getCurrentUserRole = getCurrentUserRole;
window.logout = logout;
window.createElement = createElement;
window.debounce = debounce;

